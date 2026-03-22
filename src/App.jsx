import Navigator from "./routes/Navigator";
import Layout from "./ui/controls/Layout";
import ThemeHandler from "./ui/controls/ThemeHandler";

function App() {
  return (
    <ThemeHandler>
      <Layout>
        <Navigator />
      </Layout>
    </ThemeHandler>
  );
}

export default App;
