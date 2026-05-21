export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <h1 className="text-2xl font-bold">Projeto {id}</h1>
      <p className="mt-2 text-muted-foreground">Detalhes do projeto (Fase 5)</p>
    </div>
  )
}
