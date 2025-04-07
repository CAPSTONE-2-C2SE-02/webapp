interface MetaDataProps {
  title: string;
  description?: string;
}

const MetaData = ({ title, description }: MetaDataProps) => {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={`${description ? description : "Trip Connect"}`} />
    </>
  )
}

export default MetaData