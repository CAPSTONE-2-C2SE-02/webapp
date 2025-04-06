import svgArt from "@/assets/camera-svgrepo-com.svg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    <div className="w-full h-[calc(100vh-73px)] flex items-center">
      <div className="container flex flex-col md:flex-row items-center justify-center mb-10 text-gray-700">
        <div className="max-w-md">
          <div className="text-5xl md:text-8xl font-dark font-bold animate-pulse text-primary">404</div>
          <p className="text-2xl md:text-3xl font-light leading-normal">
            Sorry we couldn't find this page.{" "}
          </p>
          <p className="mb-8">
            But dont worry, you can find plenty of other things on our homepage.
          </p>

          <Link to="/">
            <Button>
              Back to NewsFeed
            </Button>
          </Link>
        </div>
        <div className="max-w-lg">
          <img src={svgArt} alt="svg icon" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
