import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Generating.css";

const Generating = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/results", { state });
    }, 2000); 

    return () => clearTimeout(timer);
  }, [navigate, state]);

  return (
    <div className="generating-page">
      <h2 className="magic-text">♫ Moodsic is cooking… ♫</h2>
    </div>
  );
};

export default Generating;
