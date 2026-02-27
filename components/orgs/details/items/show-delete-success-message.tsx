import AlertMessage from "@/components/ui/alert-message";

type Props = {
    message: string;
}

export default function ShowDeleteSuccessMessage({message}: Readonly<Props>) {
    return (
        <AlertMessage message={message} variant="success" />
    );
}