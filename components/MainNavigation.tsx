import { menus } from "@/const";
import Menu from "./Menu";

function MainNavigation() {
    return (
        <nav className="grid grid-flow-row mt-10 pointer-events-auto">
            {
                menus.map(menu => <Menu key={ menu.label } { ...menu } />)
            }
        </nav>
    )
}

export default MainNavigation;