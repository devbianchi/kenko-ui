// Formatos do bot conforme o contrato da API (respostas de conversa vêm sem envelope).

export type EffectiveStatus = 'active' | 'closed' | 'abandoned'

export type ConversationInfo = {
  id: string
  effectiveStatus: EffectiveStatus
  revision: number
  step: string
  attemptId: string | null
}

export type BotMessage = { id: string; author: 'bot'; text: string; sentAt: string }

export type Option = { id: string; label: string }
type Named = { id: string; name: string }

export type Slot = { id: string; startsAt: string; endsAt: string; doctor: Named; room: Named }

export type Appointment = {
  id: string
  status: 'pending' | 'complete' | 'cancelled'
  canCancel: boolean
  startsAt: string
  endsAt: string
  patient: Named
  specialty: Named
  doctor: Named
  room: Named
}

export type OpeningHours = { weekdays: readonly number[]; opensAt?: string; closesAt?: string; closed?: boolean }

export type Clinic = {
  id: string
  name: string
  address: string
  phone: string
  openingHours: readonly OpeningHours[]
  specialties: readonly Named[]
}

export type View =
  | { type: 'options'; options: readonly Option[]; searchResult?: 'no_slots' }
  | { type: 'slots'; searchResult: 'available'; slots: readonly Slot[] }
  | { type: 'patient_form'; fields: readonly { name: string; type: string; required: boolean }[]; selectedSlot: Slot | null }
  | { type: 'appointments'; appointments: readonly Appointment[]; options: readonly Option[] }
  | { type: 'clinic_information'; clinic: Clinic; options: readonly Option[] }
  | { type: 'closed' }

/** Estado de uma conversa: o que a criação, a leitura e as ações devolvem. */
export type ConversationState = {
  conversation: ConversationInfo
  messages?: readonly BotMessage[]
  view: View
  availableActions: readonly string[]
}

export type Input =
  | { type: 'select_option'; optionId: string }
  | { type: 'select_slot'; slotId: string }
  | { type: 'submit_patient'; patient: { name: string; birthDate: string } }
  | { type: 'cancel_appointment'; appointmentId: string }
  | { type: 'exit' }

/** Ação enviada ou a reenviar: reenvio usa o mesmo actionId, conteúdo e revisão. */
export type PendingAction = {
  actionId: string
  expectedRevision: number
  input: Input
  /** Texto da entrada do usuário na transcrição, sem dados pessoais. */
  label: string
}

export type ConversationSummary = { id: string; effectiveStatus: EffectiveStatus; lastInteractionAt: string }

export type TranscriptEntry = { key: string; author: 'bot' | 'user'; text: string; at: string }
