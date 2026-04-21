import { redirect } from 'next/navigation'

export default function LeadDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/prospectos/${params.id}`)
}
