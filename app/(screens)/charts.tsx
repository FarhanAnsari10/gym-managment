// MemberDetailsScreen.tsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

// Color system (4 colors total)
// primary: orange; neutrals: background, card, foreground
const COLORS = {
  primary: '#FF7A00',
  bg: '#F4F4F5',
  card: '#FFFFFF',
  text: '#0F172A',
  subtle: '#6B7280',
}

type Member = {
  name: string
  phone: string
  gender: 'Male' | 'Female' | 'Other'
  trainingType: string
  address: string
  batchName: string
  batchTime: string
  memberId: string
  avatarUrl?: string
}

type Plan = {
  title: string
  totalAmount: number
  discountPercent: number
  purchaseDate?: string
  paid: number
  dueAmount: number
  dayRemaining: number
}

const member: Member = {
  name: 'Siriya Berati',
  phone: '+91 25465 55511',
  gender: 'Female',
  trainingType: 'General Training',
  address: 'Mumbai',
  batchName: 'Morning 2',
  batchTime: '6:00 AM - 7:30 AM',
  memberId: 'ABC122',
}

const plan: Plan = {
  title: '6 Month Plan',
  totalAmount: 50000,
  discountPercent: 0,
  purchaseDate: 'DD/MM/YYYY',
  paid: 150,
  dueAmount: 48550,
  dayRemaining: 1000,
}

export default function MemberDetailsScreen() {
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const completed = [true, true, true, false, false, false, false] // sample
  const streakCount = 4

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <StreakCard name={member.name.split(' ')[0]} streak={streakCount} week={week} completed={completed} />
        <InfoCard m={member} />
        <ActionsRow
          onAttendance={() => {}}
          onRenew={() => {}}
          onCall={() => Linking.openURL(`tel:${member.phone.replace(/\s/g, '')}`)}
          onBlock={() => {}}
        />
        <SectionTitle>Packages</SectionTitle>
        <PlanCard plan={plan} />
      </ScrollView>
    </View>
  )
}

function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={22} color={COLORS.card} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Member Detail</Text>
      <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
        <Ionicons name="notifications-outline" size={20} color={COLORS.card} />
      </TouchableOpacity>
    </View>
  )
}

function StreakCard({
  name,
  streak,
  week,
  completed,
}: {
  name: string
  streak: number
  week: string[]
  completed: boolean[]
}) {
  return (
    <View style={styles.card}>
      <View style={styles.streakBadge}>
        <MaterialCommunityIcons name="fire" size={36} color={COLORS.primary} />
      </View>
      <Text style={styles.streakNumber}>{streak}</Text>
      <Text style={styles.streakTitle}>Week Streak</Text>
      <Text style={styles.streakSub}>You are doing really great, {name}!</Text>

      <View style={styles.weekRow}>
        {week.map((d, i) => (
          <View key={d} style={styles.weekCell}>
            <Text style={[styles.weekLabel, i === 4 && { color: COLORS.text, fontWeight: '700' }]}>{d}</Text>
            <View
              style={[
                styles.checkCircle,
                completed[i] && { backgroundColor: '#FFE8D6', borderColor: 'transparent' },
              ]}
            >
              {completed[i] ? (
                <Ionicons name="checkmark" size={16} color={COLORS.primary} />
              ) : (
                <View />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

function InfoCard({ m }: { m: Member }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={styles.avatarBox}>
          {m.avatarUrl ? (
            <Image source={{ uri: m.avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
          ) : (
            <Ionicons name="person" size={28} color={COLORS.subtle} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.memberName}>{m.name}</Text>
          <Text style={styles.memberPhone}>{m.phone}</Text>

          <TwoColRow leftLabel="Training Type" leftValue={m.trainingType} rightLabel="Gender" rightValue={m.gender} />
          <TwoColRow leftLabel="Address" leftValue={m.address} rightLabel="Batch Name" rightValue={m.batchName} />
          <View style={styles.divider} />
          <TwoColRow leftLabel="Batch Time" leftValue={m.batchTime} rightLabel="ID" rightValue={m.memberId} />
        </View>
      </View>
    </View>
  )
}

function TwoColRow({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
}) {
  return (
    <View style={styles.twoColRow}>
      <LabeledValue label={leftLabel} value={leftValue} />
      <LabeledValue label={rightLabel} value={rightValue} align="right" />
    </View>
  )
}

function LabeledValue({
  label,
  value,
  align = 'left',
}: {
  label: string
  value: string | number
  align?: 'left' | 'right'
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, align === 'right' && { textAlign: 'right' }]}>{label}</Text>
      <Text style={[styles.value, align === 'right' && { textAlign: 'right' }]}>{String(value)}</Text>
    </View>
  )
}

function ActionsRow({
  onAttendance,
  onRenew,
  onCall,
  onBlock,
}: {
  onAttendance: () => void
  onRenew: () => void
  onCall: () => void
  onBlock: () => void
}) {
  
  return (
    <View style={[styles.card, { paddingVertical: 14 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <TouchableOpacity onPress={onAttendance} style={styles.itemStyle} activeOpacity={0.7}>
          <Ionicons name="calendar" size={22} color={COLORS.text} />
          <Text style={styles.actionText}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onRenew} style={styles.itemStyle} activeOpacity={0.7}>
          <MaterialCommunityIcons name="dumbbell" size={22} color={COLORS.text} />
          <Text style={styles.actionText}>Renew</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onCall} style={styles.itemStyle} activeOpacity={0.7}>
          <Ionicons name="call" size={22} color={COLORS.text} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBlock} style={styles.itemStyle} activeOpacity={0.7}>
          <Ionicons name="ban" size={22} color={COLORS.text} />
          <Text style={styles.actionText}>Block</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <View style={styles.card}>
      <Text style={styles.planTitle}>{plan.title}</Text>

      <View style={{ marginTop: 8, gap: 12 }}>
        <TwoColRow
          leftLabel="Total Amount"
          leftValue={`$${plan.totalAmount.toLocaleString()}`}
          rightLabel="Discount"
          rightValue={`${plan.discountPercent}%`}
        />
        <TwoColRow
          leftLabel="Purchase Date"
          leftValue={plan.purchaseDate || '-'}
          rightLabel="Paid"
          rightValue={`$${plan.paid.toLocaleString()}`}
        />
        <TwoColRow
          leftLabel="Due Amount"
          leftValue={`$${plan.dueAmount.toLocaleString()}`}
          rightLabel="Day Remaining"
          rightValue={`${plan.dayRemaining}`}
        />
      </View>
    </View>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.text,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemStyle:
  { alignItems: 'center', gap: 6, flex: 1 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    flex: 1,
    color: COLORS.card,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 12,
    gap: 12,
    paddingBottom: 28,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  // Streak
  streakBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    color: COLORS.text,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    color: COLORS.text,
    marginTop: 4,
  },
  streakSub: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.subtle,
    marginTop: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  weekCell: { alignItems: 'center', gap: 6, flex: 1 },
  weekLabel: { fontSize: 12, color: COLORS.subtle },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  memberPhone: {
    fontSize: 13,
    color: COLORS.subtle,
    marginTop: 2,
    marginBottom: 8,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  label: { color: COLORS.subtle, fontSize: 12 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },

  // Actions
  actionText: { fontSize: 12, color: COLORS.text },

  // Plan
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  planTitle: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 16,
  },
})