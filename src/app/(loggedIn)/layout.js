import SideMenu from "@/components/SideMenu";

export default function LoggedInLayout({ children }) {
  return (
    <div className="flex w-full h-full align-middle justify-center relative">
        <div className="flex relative z-10 min-w-[241px]">
            <SideMenu/>
        </div>
        <div className="flex flex-col w-[650px] h-full min-h-screen border-secondary border-r border-l relative">
          {children}
        </div>
    </div>
  );
}
