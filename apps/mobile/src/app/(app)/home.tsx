import { AuthBackdrop } from '@/components/brand/AuthBackdrop';
import { AppText } from '@/components/ui/AppText';
import { useMyTicketsQuery } from '@/store/api';
import type { TicketStatus } from '@sbs/shared';
import { Briefcase, ChevronRight, MapPin, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * My Jobs - the technician's own queue (PLAN.md J3 step 1, section 8.5 `/home`).
 *
 * Reads through RTK Query (`myTickets`), so it works from cache offline and
 * refetches on reconnect/focus (R24). Status filter is local state - the
 * query key includes it, so switching tabs refires against the cache first.
 */
const FILTERS = ['all', 'assigned', 'accepted', 'travelling', 'on_site', 'completed'] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_DOT: Record<TicketStatus, string> = {
  new: '#94A3B8',
  assigned: '#60A5FA',
  accepted: '#22D3EE',
  travelling: '#F59E0B',
  on_site: '#A78BFA',
  completed: '#10B981',
  approved: '#34D399',
  closed: '#64748B',
};

export default function HomeScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading, isError, error, refetch, isFetching } = useMyTicketsQuery(
    filter === 'all' ? undefined : { status: filter },
  );

  const tickets = data?.tickets ?? [];

  return (
    <View className="flex-1 bg-canvas-1">
      <AuthBackdrop />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <AppText weight="bold" className="text-heading text-ink">
          My Jobs
        </AppText>
        <AppText className="mt-1 text-caption text-ink-muted">
          {isFetching && !isLoading ? 'Syncing...' : `${tickets.length} job${tickets.length === 1 ? '' : 's'}`}
        </AppText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 max-h-[40px]"
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={`rounded-full border px-3 py-1.5 ${
                  active ? 'border-brand-sky bg-brand-sky/20' : 'border-brand-sky/30 bg-white/[0.03]'
                }`}
              >
                <AppText
                  weight={active ? 'semibold' : 'regular'}
                  className={`text-caption ${active ? 'text-ink' : 'text-ink-muted'}`}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          className="mt-4 flex-1"
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} tintColor="#F1F5F9" />
          }
        >
          {isLoading ? (
            <EmptyState icon={<Briefcase size={28} color="#9DB6E8" />} title="Loading jobs..." body="Pulling your queue from the office." />
          ) : isError ? (
            <EmptyState
              icon={<TriangleAlert size={28} color="#EF4444" />}
              title="Couldn't load jobs"
              body={describeQueryError(error)}
            />
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={28} color="#9DB6E8" />}
              title="No jobs here"
              body={
                filter === 'all'
                  ? 'Nothing assigned yet. New jobs from the coordinator land here.'
                  : `Nothing ${filter.replace('_', ' ')} right now.`
              }
            />
          ) : (
            tickets.map((ticket) => (
              <View
                key={ticket.id}
                className="rounded-2xl border border-brand-sky/30 bg-white/[0.03] px-4 py-3"
              >
                <View className="flex-row items-center gap-2">
                  <View style={{ ...styles.dot, backgroundColor: STATUS_DOT[ticket.status] }} />
                  <AppText weight="semibold" className="flex-1 text-label capitalize text-ink">
                    {ticket.status.replace('_', ' ')}
                  </AppText>
                  <AppText className="text-caption uppercase text-ink-muted">{ticket.priority}</AppText>
                </View>

                <AppText weight="semibold" className="mt-2 text-label text-ink">
                  {ticket.title}
                </AppText>

                {ticket.description ? (
                  <AppText className="mt-1 text-caption text-ink-muted" numberOfLines={2}>
                    {ticket.description}
                  </AppText>
                ) : null}

                <View className="mt-2 flex-row items-center gap-4">
                  {ticket.officeCode ? (
                    <View className="flex-row items-center gap-1">
                      <MapPin size={13} color="#9DB6E8" />
                      <AppText className="text-caption text-ink-subtle">{ticket.officeCode}</AppText>
                    </View>
                  ) : null}
                  <AppText className="text-caption text-ink-subtle">{ticket.complaintType.replace(/_/g, ' ')}</AppText>
                  <View className="flex-1" />
                  <ChevronRight size={16} color="#9DB6E8" />
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <AppText className="mt-4 text-center text-caption text-ink-muted">
          Visit check-in lands here next (PLAN.md J3 steps 2-3).
        </AppText>
      </SafeAreaView>
    </View>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <View className="items-center gap-2 rounded-2xl border border-brand-sky/30 bg-white/[0.03] px-6 py-10">
      {icon}
      <AppText weight="semibold" className="mt-2 text-center text-label text-ink">
        {title}
      </AppText>
      <AppText className="text-center text-caption text-ink-muted">{body}</AppText>
    </View>
  );
}

function describeQueryError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const payload = (error as { data?: { message?: unknown } }).data;
    if (payload && typeof payload.message === 'string' && payload.message.length > 0) {
      return payload.message;
    }
  }
  return 'Check your connection - cached jobs stay visible while offline.';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12 },
  filterRow: { gap: 8, paddingRight: 8, alignItems: 'center' },
  list: { gap: 10, paddingBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
