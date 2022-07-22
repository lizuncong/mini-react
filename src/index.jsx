import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
const themes = {
    foreground: "red",
    background: "#eeeeee",
};
const ThemeContext = React.createContext(themes);

const Home = () => {
  const [count, setCount] = useState(0);
  const myRef = useRef(null);
  const theme = useContext(ThemeContext);
  useEffect(() => {
    console.log("useEffect", count);
  }, [count]);
  useLayoutEffect(() => {
    console.log("useLayoutEffect...", myRef);
  });
  const res = useMemo(() => {
    console.log("useMemo");
    return count * count;
  }, [count]);
  console.log("res...", res);
  const onClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);
  return (
    <div style={{ color: theme.foreground }} ref={myRef} onClick={onClick}>
      {count}
    </div>
  );
};

ReactDOM.render(<Home />, document.getElementById("root"));
