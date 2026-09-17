import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { SendMessageInput } from "@/schemas/messageSchema";

interface InputChatProps {
    id: string;
}

export const InputChat = ({ id }: InputChatProps) => {
    return (
        <Input
            id={id}
            className="rounded-2xl p-6"
            placeholder="Digite uma mensagem"
        />
    );
}