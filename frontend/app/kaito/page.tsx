import sampleUsers from "@/data/sample-users.json";
import SocialGraph from "@/components/SocialGraph";

export default function Kaito() {
  const users = sampleUsers;
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Developer Social Network</h1>
      <SocialGraph users={users} />
    </div>
  );
}
