import { MapPin } from "lucide-react";
import { Link } from "react-router";

const TourAttachment = () => {
  return (
    <Link to={`/tours/tourId?fromPost=true`} className="group">
      <div className="w-full p-2 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-6 mt-2 group-hover:shadow">
        <div className="w-60 h-32 rounded-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1741462434929-0ea63a52917c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="photo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-medium text-primary line-clamp-2">
            Ha Giang Loop and Dong Van Kast Plateau Amazing 2 Days Car Tour
          </h3>
          <div className="flex items-center gap-1 mt-1 text-emerald-600 font-medium">
            <MapPin className="size-3" />
            <span className="text-sm">Ha Giang</span>
          </div>
          <p className="text-xs line-clamp-2 mt-1">
            Explore the rural wonders of Cao Bang and Ha Giang. Explore the most
            famous places in the North such as Ban Gioc Waterfall, Nguom Ngao
            Cave, Nho Que River, Dong Van Stone Plateau,...
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TourAttachment;
