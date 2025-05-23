import { Loader2 } from "lucide-react"

const LoaderSpin = ({ text }: { text: string }) => {
  return (
    <>
      <Loader2 className="size-4 animate-spin" />
      {text}
    </>
  )
}

export default LoaderSpin