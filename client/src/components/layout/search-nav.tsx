import { Button } from '../ui/button'
import { Search } from 'lucide-react'

const FollowHeader = () => {
    return (
        <div className='flex flex-col w-full gap-3 p-3'>
            <div className=" w-full pl-2 pr-4 flex justify-between gap-5 ">
                <div className="p-2 items-center">
                    <p>814 follower</p>
                </div>
                <div className="flex gap-5">
                    {/* <SearchInput /> */}
                    <div className="flex items-center gap-3 bg-zinc-100 min-w-96 w-full py-[9px] px-4 rounded-lg flex-1">
                        <Search className="size-4" />
                        <input
                            type="text"
                            placeholder=""
                            className="bg-transparent border-none outline-none placeholder:text-zinc-500 placeholder:text-sm leading-none flex-1"
                        />
                    </div>
                    <Button>
                        <Search className="size-4" />
                        Search
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default FollowHeader