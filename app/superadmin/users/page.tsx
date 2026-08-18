import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { toSafeUser } from "@/lib/serializers";
import PageHeader from "@/components/superadmin/PageHeader";
import UsersTable from "@/components/superadmin/UsersTable";

async function getUsers() {
  await connectToDatabase();
  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  return users.map(toSafeUser);
}

export default async function SuperadminUsersPage() {
  const users = await getUsers();

  return (
    <>
      <PageHeader crumb="PLATFORM" title="Users" subtitle="Every registered account and its role on UmrahChal" />
      <div className="mt-[22px]">
        <UsersTable users={users} />
      </div>
    </>
  );
}
