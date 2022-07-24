import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  forwardRef,
} from "react";
import ReactDOM from "react-dom";
const themes = {
  foreground: "red",
  background: "#eeeeee",
};
const ThemeContext = React.createContext(themes);

const Home = forwardRef((props, ref) => {
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
  useImperativeHandle(ref, () => ({
    focus: () => {
      myRef.current.focus();
    },
  }));

  const onClick = useCallback(() => {
    debugger;
    setCount(count + 1);
    setCount(2);
    setCount(3);
  }, [count]);
  return (
    <div style={{ color: theme.foreground }} ref={myRef} onClick={onClick}>
      {count}
    </div>
  );
});

ReactDOM.render(<Home />, document.getElementById("root"));
