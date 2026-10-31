import Screen from "../components/molecules/Screen";
import WhoToFollow from "../components/organisms/WhoToFollow";

function RightSidebar() {
  return (
    <Screen className="hidden lg:flex lg:w-[30%] fixed top-0 right-0 h-full gap-4 overflow-y-auto">
      <WhoToFollow />
    </Screen>
  );
}

export default RightSidebar;
