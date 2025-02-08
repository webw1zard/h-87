"use client";
import { useState, useEffect } from "react";
import { createClient } from "../supabase/client";

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  image: string;
}

export default function Home() {
  const [Users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const supabase = createClient();
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase.from("Users").select("*");
    if (error) console.log(error);
    else setUsers(data as User[]);
  }

  async function addUser() {
    let imageUrl = "";
    if (image) {
      const { data, error } = await supabase.storage
        .from("Users")
        .upload(`Users/${Date.now()}.jpg`, image);
      if (error) console.log(error);
      else imageUrl = data.path;
    }

    const { error } = await supabase
      .from("Users")
      .insert([{ name, age: Number(age), email, image: imageUrl }]);

    if (error) console.log(error);
    else fetchUsers();
    setAge("");
    setName("");
    setEmail("");
    setImage(null);
  }

  async function updateUser() {
    if (!selectedUser) return;
    const { error } = await supabase
      .from("Users")
      .update({
        name,
        age: Number(age),
        email,
      })
      .match({ id: selectedUser.id });

    if (error) console.log(error);
    else {
      fetchUsers();
      setIsEditing(false);
      setSelectedUser(null);
    }
  }

  async function deleteUser(id: number) {
    await supabase.from("Users").delete().match({ id });
    fetchUsers();
  }

  return (
    <div className="flex p-6 max-w-5xl mx-auto space-x-6">
      <div className="w-1/3 border p-4 rounded-lg shadow-lg bg-white">
        {selectedUser ? (
          <div className="text-center">
            <img
              src={`https://jyighudlgmskjajoquce.supabase.co/storage/v1/object/public/${selectedUser.image}`}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto border shadow-sm"
            />
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border p-2 w-full rounded mt-2"
                />
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="border p-2 w-full rounded mt-2"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border p-2 w-full rounded mt-2"
                />
                <button
                  onClick={updateUser}
                  className="bg-green-500 text-white px-3 py-1 rounded mt-2 hover:bg-green-600"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mt-2">{selectedUser.name}</h2>
                <p className="text-gray-600">{selectedUser.age} years old</p>
                <p className="text-blue-500">{selectedUser.email}</p>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setName(selectedUser.name);
                    setAge(String(selectedUser.age));
                    setEmail(selectedUser.email);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mt-2 hover:bg-yellow-600"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">Select a user</div>
        )}
      </div>

      <div className="w-2/3 p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-xl font-bold">User Management</h1>
        <div className="mt-4 space-y-2">
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <label className="custum-file-upload" htmlFor="file">
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill=""
                viewBox="0 0 24 24"
              >
                <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
                <g
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  id="SVGRepo_tracerCarrier"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fill=""
                    d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                    clip-rule="evenodd"
                    fill-rule="evenodd"
                  ></path>{" "}
                </g>
              </svg>
            </div>
            <div className="text">
              <span>Click to upload image</span>
            </div>
            <input
              id="file"
              type="file"
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
              className="border p-2 w-full rounded"
              hidden
            />
          </label>

          <button
            onClick={addUser}
            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
          >
            Save
          </button>
        </div>

        <h2 className="text-lg font-bold mt-6">Users</h2>
        <ul className="divide-y mt-2">
          {Users.map((user) => (
            <li
              key={user.id}
              className="flex justify-between items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition"
              onClick={() => setSelectedUser(user)}
            >
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.age} years old</p>
                <p className="text-sm text-blue-500">{user.email}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteUser(user.id);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
