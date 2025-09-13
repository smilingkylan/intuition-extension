import { Separator } from "./ui/separator"

export const VerticalTriple = ({ atomsData }: { atomsData: any[] }) => {
  return (
    <div className="flex flex-col gap-1">
      {atomsData.map((atomData, index) => {
        return (
          <div key={atomData.term_id}>
            <TripleRow atomData={atomData} />
            {index < atomsData.length - 1 && <Separator className="my-1" />}
          </div>
        )
      })}
    </div>
  )
}

export const TripleRow = ({ atomData }: { atomData: any }) => {
  const { data, label, value } = atomData
  let syntax = label || data
  if (value) {
    const { thing, person, organization } = value
    syntax = label || thing?.name || person?.name || organization?.name
  }
  return (
    <div
      className="flex flex-col text-center"
      title={JSON.stringify(atomData, null, 2)}
    >
      {syntax}
    </div>
  )
}