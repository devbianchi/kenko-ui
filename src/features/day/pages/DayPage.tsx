import { useParams } from 'react-router'
import { PageHeading } from '../../../shared/components/PageHeading'

export function DayPage() {
  const { date } = useParams()
  return <PageHeading title={date ? `Dia ${date}` : 'Dia'} description="Resumo das consultas do dia selecionado." />
}
