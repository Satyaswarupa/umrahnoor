import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { toSafeUser } from "@/lib/serializers";

async function getUsers() {
  await connectToDatabase();
  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  return users.map(toSafeUser);
}

export default async function SuperadminUsersPage() {
  const users = await getUsers();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-emerald-950">Users</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        All registered accounts on UmrahNoor, including customers, agents, and admins.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-emerald-900/10">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-900/10 text-xs font-medium uppercase tracking-wide text-emerald-900/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-emerald-900/5 last:border-0">
                <td className="px-4 py-3 text-emerald-950">{user.name}</td>
                <td className="px-4 py-3 text-emerald-900/80">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-emerald-900/60">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-10 text-center text-emerald-900/60">No users yet.</p>
        )}
      </div>
    </div>
  );
}
