import { observer } from "mobx-react-lite";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

const HEALTH = gql`
  query Health {
    health
  }
`;

const App = observer(function App() {
  const { data } = useQuery(HEALTH);
  return (
    <div className="app">
      <h1>Synchr</h1>
      <p>Health: {data?.health ?? "loading..."}</p>
    </div>
  );
});

export default App;
