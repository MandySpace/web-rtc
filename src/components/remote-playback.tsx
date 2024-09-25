import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

function RemotePlayback() {
  return (
    <>
      <div className="absolute inset-0">
        <video className="w-full h-full object-cover" src="/placeholder.svg" />
      </div>
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-full p-2">
        <Avatar className="h-10 w-10 ring-2 ring-white">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Caller" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </>
  );
}

export default RemotePlayback;
