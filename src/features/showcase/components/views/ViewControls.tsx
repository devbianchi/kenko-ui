import { useState } from 'react'
import type { FormEvent } from 'react'
import { formatDayTime, formatSlot } from '../../format'
import type { Appointment, Input, OpeningHours, Option, View } from '../../types'
import { ChoiceButton } from './ChoiceButton'

type Send = (input: Input, label: string) => void
type ViewControlsProps = { view: View; disabled: boolean; fieldErrors?: Record<string, string>; onSend: Send }

const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const statusNames = { pending: 'Pendente', complete: 'Completa', cancelled: 'Cancelada' }

function Options({ options, disabled, onSend }: { options: readonly Option[]; disabled: boolean; onSend: Send }) {
  return <>{options.map(option => (
    <ChoiceButton key={option.id} disabled={disabled} onClick={() => onSend({ type: 'select_option', optionId: option.id }, option.label)}>
      {option.label}
    </ChoiceButton>
  ))}</>
}

function openingLine(hours: OpeningHours) {
  const first = weekdayNames[hours.weekdays[0]]
  const last = weekdayNames[hours.weekdays[hours.weekdays.length - 1]]
  const days = hours.weekdays.length > 1 ? `${first} a ${last}` : first
  return hours.closed ? `${days}: fechado` : `${days}: ${hours.opensAt} às ${hours.closesAt}`
}

function AppointmentCard({ appointment, disabled, onSend }: { appointment: Appointment; disabled: boolean; onSend: Send }) {
  const when = formatDayTime(appointment.startsAt)
  return (
    <li className="rounded-2xl bg-background p-3 shadow-card" aria-label={`Consulta de ${when}`}>
      <p className="font-semibold">{when} · {statusNames[appointment.status]}</p>
      <p className="text-label text-text-muted">{appointment.specialty.name} · {appointment.doctor.name} · {appointment.room.name}</p>
      {appointment.canCancel && (
        <button type="button" disabled={disabled} onClick={() => onSend({ type: 'cancel_appointment', appointmentId: appointment.id }, `Cancelar a consulta de ${when}`)}
          className="mt-2 rounded-xl bg-foreground px-3 py-1.5 text-label font-semibold text-background disabled:opacity-60">
          Cancelar consulta
        </button>
      )}
    </li>
  )
}

function PatientForm({ disabled, fieldErrors, onSend }: { disabled: boolean; fieldErrors?: Record<string, string>; onSend: Send }) {
  // O que foi digitado fica no formulário mesmo quando a API recusa um campo.
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const nameError = fieldErrors?.['patient.name']
  const birthDateError = fieldErrors?.['patient.birthDate']

  function submit(event: FormEvent) {
    event.preventDefault()
    onSend({ type: 'submit_patient', patient: { name, birthDate } }, 'Dados do paciente informados')
  }

  return (
    <form onSubmit={submit} aria-label="Dados do paciente" className="grid gap-3 rounded-2xl bg-background p-4 shadow-card">
      <label className="grid gap-1 text-label font-semibold">Nome completo
        <input value={name} onChange={event => setName(event.target.value)} required maxLength={100} disabled={disabled}
          aria-invalid={nameError ? 'true' : undefined} aria-describedby={nameError ? 'patient-name-error' : undefined}
          className="rounded-lg border border-border bg-background px-3 py-2 font-normal" />
      </label>
      {nameError && <p id="patient-name-error" className="text-label text-red-800 dark:text-red-300">{nameError}</p>}
      <label className="grid gap-1 text-label font-semibold">Data de nascimento
        <input type="date" value={birthDate} onChange={event => setBirthDate(event.target.value)} required disabled={disabled}
          aria-invalid={birthDateError ? 'true' : undefined} aria-describedby={birthDateError ? 'patient-birth-error' : undefined}
          className="rounded-lg border border-border bg-background px-3 py-2 font-normal" />
      </label>
      {birthDateError && <p id="patient-birth-error" className="text-label text-red-800 dark:text-red-300">{birthDateError}</p>}
      <button type="submit" disabled={disabled} className="rounded-xl bg-foreground px-4 py-2 font-semibold text-background disabled:opacity-60">Confirmar</button>
    </form>
  )
}

/** Controles da tela atual do bot. O backend decide as opções; aqui só se renderiza o que veio. */
export function ViewControls({ view, disabled, fieldErrors, onSend }: ViewControlsProps) {
  switch (view.type) {
    case 'options':
      return <Options options={view.options} disabled={disabled} onSend={onSend} />
    case 'slots':
      return <>{view.slots.map(slot => (
        <ChoiceButton key={slot.id} disabled={disabled} onClick={() => onSend({ type: 'select_slot', slotId: slot.id }, `Horário: ${formatSlot(slot)}`)}>
          {formatSlot(slot)} · {slot.doctor.name} · {slot.room.name}
        </ChoiceButton>
      ))}</>
    case 'patient_form':
      return <>
        {view.selectedSlot && <p className="text-label text-text-muted">Horário escolhido: {formatSlot(view.selectedSlot)} · {view.selectedSlot.doctor.name}</p>}
        <PatientForm disabled={disabled} fieldErrors={fieldErrors} onSend={onSend} />
      </>
    case 'appointments':
      return <>
        {view.appointments.length === 0
          ? <p className="rounded-2xl bg-background p-3 shadow-card">Nenhuma consulta nesta conversa.</p>
          : <ul aria-label="Consultas desta conversa" className="grid gap-2">{view.appointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} disabled={disabled} onSend={onSend} />
            ))}</ul>}
        <Options options={view.options} disabled={disabled} onSend={onSend} />
      </>
    case 'clinic_information':
      return <>
        <section aria-label="Informações da clínica" className="rounded-2xl bg-background p-4 shadow-card">
          <p className="font-semibold">{view.clinic.name}</p>
          <p>{view.clinic.address}</p>
          <p>Telefone: {view.clinic.phone}</p>
          <ul className="mt-2">{view.clinic.openingHours.map(hours => <li key={hours.weekdays.join('-')}>{openingLine(hours)}</li>)}</ul>
          <p className="mt-2">Especialidades: {view.clinic.specialties.map(specialty => specialty.name).join(', ')}</p>
        </section>
        <Options options={view.options} disabled={disabled} onSend={onSend} />
      </>
    case 'closed':
      return null
    default: {
      const unknown: never = view
      return unknown
    }
  }
}
