
function ThemeFooter() {
  return (
    <div id="footer">
      <ThemeContext.Consumer>{(value) => value}</ThemeContext.Consumer>
    </div>
  );
}

function ThemeHeader() {
  const value = useContext(ThemeContext);

  return <div id="header函数组件">{value}</div>;
}

function Toolbar() {
  return (
    <div>
      <ThemeHeader />
      <ThemedButton />
      <ThemeFooter />
    </div>
  );
}