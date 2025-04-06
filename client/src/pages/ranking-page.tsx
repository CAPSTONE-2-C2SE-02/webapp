import RankingItem from "@/components/user/ranking-item";
import { Link } from "react-router"

const RankingPage = () => {
  return (
    <div className="w-full max-w-lg md:max-w-4xl mx-auto my-10">
      <div className="space-y-6">
        <h1 className="text-4xl text-primary font-extrabold text-center"><span className="text-cyan-600">TOUR GUIDE</span> RANKING</h1>
        <div className="w-full pt-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[5fr_6fr_5fr] items-end gap-4">
            <Link to={`/n2duc`}>
              <figure className="shadow-md rounded-xl group">
                <div className="relative bg-white rounded-t-xl h-20 py-4 px-10">
                  <h4 className="text-4xl font-black italic text-sky-400 group-hover:translate-x-5 transition-all duration-300">II</h4>
                  <div className="absolute -top-6 right-4 h-32 w-32 p-1.5 bg-white rounded-3xl z-40 border-t group-hover:scale-110 group-hover:-translate-x-5 transition-all duration-300">
                    <img src="http://localhost:5173/src/assets/avatar-demo.jpg" alt="" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                  <hr className="w-full absolute bottom-0 right-0 border-t-8 border-sky-400" />
                </div>
                <figcaption className="px-5 py-4 bg-primary text-white rounded-b-xl font-madimi">
                  <span className="text-sm">Tour guide</span>
                  <h4 className="text-2xl font-black">DANG KHOA</h4>
                </figcaption>
              </figure>
            </Link>
            <Link to={`/n2duc`}>
              <figure className="shadow-md rounded-xl group">
                <div className="relative bg-white rounded-t-xl h-24 py-4 px-10">
                  <h4 className="text-4xl font-black italic text-orange-400 group-hover:translate-x-5 transition-all duration-300">I</h4>
                  <div className="absolute -top-6 right-5 h-36 w-36 p-1.5 bg-white rounded-3xl z-40 border-t group-hover:scale-110 group-hover:-translate-x-5 transition-all duration-300">
                    <img src="http://localhost:5173/src/assets/avatar-demo.jpg" alt="" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                  <hr className="w-full absolute bottom-0 right-0 border-t-8 border-orange-400" />
                </div>
                <figcaption className="px-5 py-4 bg-primary text-white rounded-b-xl font-madimi">
                  <span className="text-sm">Tour guide</span>
                  <h4 className="text-2xl font-black">DANG KHOA</h4>
                </figcaption>
              </figure>
            </Link>
            <Link to={`/n2duc`}>
              <figure className="shadow-md rounded-xl group">
                <div className="relative bg-white rounded-t-xl h-[70px] py-4 px-10">
                  <h4 className="text-4xl font-black italic text-teal-400 group-hover:translate-x-5 transition-all duration-300">III</h4>
                  <div className="absolute -top-5 right-4 h-28 w-28 p-1.5 bg-white rounded-3xl z-40 border-t group-hover:scale-110 group-hover:-translate-x-5 transition-all duration-300">
                    <img src="http://localhost:5173/src/assets/avatar-demo.jpg" alt="" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                  <hr className="w-full absolute bottom-0 right-0 border-t-8 border-teal-400" />
                </div>
                <figcaption className="px-5 py-4 bg-primary text-white rounded-b-xl font-madimi">
                  <span className="text-sm">Tour guide</span>
                  <h4 className="text-2xl font-black">DANG KHOA</h4>
                </figcaption>
              </figure>
            </Link>
          </div>
          <ul className="flex flex-col gap-[1px]">
            {Array.from({ length: 10 }, (_, index) => (
              <li key={index}>
                <RankingItem />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
};

export default RankingPage;