import CoreInterface from "../../interface/_core";

class Notice extends CoreInterface {
    /**
     * @description Open the notice panel
     * @param text Notice message
     */
    open(text: string): void;

    /**
     * @description Close the notice panel
     */
    close(): void;
}

export default Notice;