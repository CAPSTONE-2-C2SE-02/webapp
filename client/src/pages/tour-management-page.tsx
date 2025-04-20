import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { Link } from "react-router"

const TourManagementPage = () => {
  return (
    <div>
      <h1>TourManagement</h1>
      <Button asChild>
        <Link to={"/tours/create"}>
          <PlusIcon className="left-3" /> Create new tour
        </Link>
      </Button>
    </div>
  )
}

export default TourManagementPage