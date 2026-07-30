"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import * as familyGuardianApi from "@/lib/family-guardian-api";
import EmptyState from "@/app/family-guardian/components/EmptyState";
import LoadingState from "@/app/family-guardian/components/LoadingState";
import { motion, AnimatePresence } from "framer-motion";

interface Child {
  _id: string;
  name: string;
  age: number;
  avatar?: string;
}

export default function ManageChildrenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState<number | string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchChildren();
    }
  }, [status, router]);

  async function fetchChildren() {
    setLoading(true);
    setError(null);
    try {
      const data = await familyGuardianApi.getChildren();
      if (data.ok) {
        setChildren(data.children);
      } else {
        setError(data.error || "Failed to load children.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddChild(e: React.FormEvent) {
    e.preventDefault();
    if (!newChildName.trim() || !newChildAge || isNaN(Number(newChildAge))) {
      setError("Please enter a valid name and age for the child.");
      return;
    }
    try {
      const res = await familyGuardianApi.createChild({
        name: newChildName.trim(),
        age: Number(newChildAge),
      });
      if (res.ok) {
        setNewChildName("");
        setNewChildAge("");
        setShowAddChildForm(false);
        fetchChildren(); // Refresh the list
      } else {
        setError(res.error || "Failed to add child.");
      }
    } catch (err) {
      setError("Failed to add child.");
      console.error(err);
    }
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading children...</div>;
  }

  if (error) {
    return <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">{error}</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Manage Children</h1>

      {children.length === 0 && !loading ? (
        <EmptyState
          icon="👨‍👩‍👧‍👦"
          title="No Children Found"
          description="Get started by adding your first child to the family."
          action={{ label: "Add Child", onClick: () => setShowAddChildForm(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence>
            {children.map((child) => (
              <motion.div
                key={child._id}
                className="bg-gray-700 rounded-lg shadow-lg p-6 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl mb-4">{child.avatar || "👶"}</div>
                <h2 className="text-xl font-semibold mb-2">{child.name}</h2>
                <p className="text-gray-400 mb-4">Age: {child.age}</p>
                <Link href={`/dashboard/family-guardian/children/${child._id}/overview`} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                  Manage {child.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gray-700 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-purple-500 cursor-pointer"
              onClick={() => setShowAddChildForm(true)}
            >
              <span className="text-5xl text-gray-400">+</span>
              <h2 className="text-xl font-semibold mt-4">Add New Child</h2>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {showAddChildForm && (
        <motion.form
          onSubmit={handleAddChild}
          className="bg-gray-700 rounded-lg shadow-lg p-6 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <h3 className="text-xl font-semibold mb-4">Add New Child</h3>
          <div className="mb-4">
            <label htmlFor="childName" className="block text-gray-300 text-sm font-bold mb-2">
              Child's Name
            </label>
            <input
              type="text"
              id="childName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-600 text-white"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="childAge" className="block text-gray-300 text-sm font-bold mb-2">
              Child's Age
            </label>
            <input
              type="number"
              id="childAge"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-600 text-white"
              value={newChildAge}
              onChange={(e) => setNewChildAge(e.target.value)}
              min="0"
              max="18"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
            >
              Add Child
            </button>
            <button
              type="button"
              onClick={() => setShowAddChildForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}