import { Link } from "react-router"

interface TopRankingProps {
  tourGuide: {
    _id: string;
    fullName: string;
    profilePicture: string;
    username: string;
  },
  rank: number;
  point: number;
};

const TopRanking = ({ tourGuide, rank, point }: TopRankingProps) => {
  if (rank === 1) {
    return (
      <Link to={`/${tourGuide?.username}`}>
        <figure className="shadow-md rounded-xl group">
          <div className="relative bg-white rounded-t-xl h-24 py-4 px-10">
            <h4 className="text-4xl font-black italic text-orange-400 group-hover:translate-x-5 transition-all duration-300">I</h4>
            <div className="absolute -top-6 right-5 h-36 w-36 p-1.5 bg-white rounded-3xl z-40 border-t group-hover:scale-110 group-hover:-translate-x-5 transition-all duration-300">
              <img src={tourGuide?.profilePicture} alt="" className="w-full h-full object-cover rounded-3xl" />
            </div>
            <hr className="w-full absolute bottom-0 right-0 border-t-8 border-orange-400" />
          </div>
          <figcaption className="flex items-end justify-between px-5 py-4 bg-primary text-white rounded-b-xl font-madimi">
            <div>
              <span className="text-sm">Tour guide</span>
              <h4 className="text-2xl font-black">{tourGuide?.fullName}</h4>
            </div>
            <div className="bg-slate-100 px-2 py-0.5 rounded-md text-primary">{point.toFixed(1)}</div>
          </figcaption>
        </figure>
      </Link>
    )
  }

  if (rank == 2) {
    return (
      <Link to={`/${tourGuide?.username}`}>
        <figure className="shadow-md rounded-xl group">
          <div className="relative bg-white rounded-t-xl h-20 py-4 px-10">
            <h4 className="text-4xl font-black italic text-sky-400 group-hover:translate-x-5 transition-all duration-300">II</h4>
            <div className="absolute -top-6 right-4 h-32 w-32 p-1.5 bg-white rounded-3xl z-40 border-t group-hover:scale-110 group-hover:-translate-x-5 transition-all duration-300">
              <img src={tourGuide?.profilePicture} alt="" className="w-full h-full object-cover rounded-3xl" />
            </div>
            <hr className="w-full absolute bottom-0 right-0 border-t-8 border-sky-400" />
          </div>
          <figcaption className="flex items-end justify-between px-5 py-4 bg-primary text-white rounded-b-xl font-madimi">
            <div>
              <span className="text-sm">Tour guide</span>
              <h4 className="text-2xl font-black">{tourGuide?.fullName}</h4>
            </div>
            <div className="bg-slate-100 px-2 py-0.5 rounded-md text-primary">{point.toFixed(1)}</div>
          </figcaption>
        </figure>
      </Link>
    )
  }

  return (
    <Link to={`/${tourGuide?.username}`}>
      <figure className="shadow-md rounded-xl group">
        <div className="relative bg-white rounded-t-xl h-[70px] py-4 px-10">
          <h4 className="text-4xl font-black italic text-teal-400 group-hover:translate-x-5 transition-all duration-300">III</h4>
          <div className="absolute -top-5 right-4 h-28 w-28 p-1.5 bg-white rounded-3xl z-40 border-t group-hover:scale-110 group-hover:-translate-x-5 transition-all duration-300">
            <img src={tourGuide?.profilePicture} alt="" className="w-full h-full object-cover rounded-3xl" />
          </div>
          <hr className="w-full absolute bottom-0 right-0 border-t-8 border-teal-400" />
        </div>
        <figcaption className="flex items-end justify-between px-5 py-4 bg-primary text-white rounded-b-xl font-madimi">
          <div>
            <span className="text-sm">Tour guide</span>
            <h4 className="text-2xl font-black">{tourGuide?.fullName}</h4>
          </div>
          <div className="bg-slate-100 px-2 py-0.5 rounded-md text-primary">{point.toFixed(1)}</div>
        </figcaption>
      </figure>
    </Link>
  )
};

export default TopRanking;