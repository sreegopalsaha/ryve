import Screen from "../components/molecules/Screen";
import WhoToFollow from "../components/organisms/WhoToFollow";

function RightSidebar() {
  return (
    <Screen className="hidden md:flex w-[30%] fixed top-0 right-0 h-full gap-4">
      <WhoToFollow />
    </Screen>
  );
}

export default RightSidebar;
