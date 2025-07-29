import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import "./MemberDirectory/MemberDirectory.css"; // Use a shared minimal style, customize freely for admin

// Helper component for a row in the member list
function UserRow({ user, currentUser, onRoleChange }) {
  // Can't let admin demote themselves to non-admin or remove themselves
  const isSelf = user.id === currentUser.id;

  return (
    <tr>
      <td>{user.email}</td>
      <td>{user.role || "member"}</td>
      <td>
        {!isSelf && (
          <>
            <button className="btn-accent"
              onClick={() => onRoleChange(user, "admin")}
              disabled={user.role === "admin"}>
              Make Admin
            </button>
            <button
              onClick={() => onRoleChange(user, "member")}
              disabled={user.role === "member"}>
              Make Member
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

// PUBLIC_INTERFACE
function AdminInviteManager() {
  /** Admin panel for managing invites and member roles */
  const { user, isAdmin } = useContext(AuthContext);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [users, setUsers] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Load all users and roles (RBAC requires RLS policy allowing select for admin)
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [isAdmin]);

  async function fetchUsers() {
    setLoading(true);
    // Assuming a table called "profiles" exists w/ id, email, role columns
    let { data, error } = await supabase
      .from("profiles")
      .select("id, email, role")
      .order("email", { ascending: true });

    if (error) {
      setStatusMsg("Failed to load users: " + error.message);
    } else {
      setUsers(data);
      setStatusMsg("");
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE (admin only)
  async function sendInvite(e) {
    e.preventDefault();
    setStatusMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
        // Pass custom redirect or role in metadata if supported by your backend
        data: { role: inviteRole }
      });
      if (error) throw error;
      setStatusMsg("Invite sent!");
      setInviteEmail("");
    } catch (err) {
      setStatusMsg("Failed to send invite: " + err.message);
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE (admin only)
  async function handleRoleChange(userObj, newRole) {
    setStatusMsg("");
    setLoading(true);

    // Update the user's role in the database
    const roleResult = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userObj.id);

    if (roleResult.error) {
      setStatusMsg("Failed to update role: " + roleResult.error.message);
    } else {
      setStatusMsg(`Role updated to ${newRole}`);
      fetchUsers();
    }
    setLoading(false);
  }

  if (!isAdmin) {
    return (
      <div style={{ margin: "2rem" }}>
        <h2 style={{ color: "#FF6F00" }}>Admin Tools</h2>
        <div>You do not have admin privileges.</div>
      </div>
    );
  }

  return (
    <div style={{ margin: "2rem" }}>
      <h2 style={{ color: "#FF6F00" }}>Admin Tools: Invitations & Roles</h2>
      <form onSubmit={sendInvite} className="invite-form">
        <label>
          Invite new member email:
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            placeholder="abc@example.com"
            style={{ marginLeft: "1rem" }}
          />
        </label>
        <select
          value={inviteRole}
          onChange={e => setInviteRole(e.target.value)}
          style={{ marginLeft: "1rem" }}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading || !inviteEmail}>
          Send Invite
        </button>
      </form>
      <div style={{ marginTop: "1rem", color: "#ff6f00" }}>{statusMsg}</div>

      <hr style={{ margin: "2rem 0" }} />
      <h3>Manage Roles</h3>
      {loading && <div>Loading...</div>}
      <table className="member-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <UserRow
              key={u.id}
              user={u}
              currentUser={user}
              onRoleChange={handleRoleChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminInviteManager;
