import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [note, setNote] = useState("");
  const [txnRef, setTxnRef] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError("Failed to load order"));
  }, [id]);

  const doAction = async (action, body = {}) => {
    try {
      setError("");
      const { data } = await api.post(`/orders/${id}/${action}`, body);
      setOrder(data);
      setNote("");
      setTxnRef("");
    } catch (e) {
      const d = e.response?.data;
      setError(
        (typeof d === "string" ? d : d?.detail || d?.message || d?.error) ||
          "Action failed",
      );
    }
  };

  if (!order) return <p>Loading…</p>;

  const isOwner = order.createdBy === user.username;
  const isCreator = user.role === "CREATOR";
  const isPurchaser = user.role === "PURCHASER";
  const canEdit =
    isCreator &&
    isOwner &&
    (order.status === "DRAFT" || order.status === "RETURNED");
  const canActOnSubmitted = isPurchaser && order.status === "SUBMITTED";
  const canComplete = isPurchaser && order.status === "APPROVED";

  return (
    <div>
      <button className="secondary mb-4" onClick={() => navigate("/orders")}>
        ← Back to Orders
      </button>

      <div className="bg-white rounded-lg p-6 shadow-sm mb-5">
        <div className="flex justify-between items-start">
          <h2 className="m-0">{order.title}</h2>
          <StatusBadge status={order.status} />
        </div>
        <div className="mt-3 flex gap-6 text-gray-600 text-sm">
          <span>
            Created by: <strong>{order.createdBy}</strong>
          </span>
          <span>
            Expires: <strong>{order.expiresAt}</strong>
          </span>
          {order.createdAt && (
            <span>
              Created:{" "}
              <strong>{new Date(order.createdAt).toLocaleString()}</strong>
            </span>
          )}
        </div>
      </div>

      {order.purchaserNote && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <strong>Note from Purchaser:</strong> {order.purchaserNote}
        </div>
      )}

      {order.txnReference && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <strong>Transaction Reference:</strong> {order.txnReference}
        </div>
      )}

      <div className="bg-white rounded-lg p-6 shadow-sm mb-5">
        <h3 className="mt-0 mb-3">Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="error text-sm">{error}</p>}

      <div className="flex gap-2.5 flex-wrap items-center">
        {canEdit && (
          <button
            className="secondary"
            onClick={() => navigate(`/orders/${id}/edit`)}
          >
            Edit
          </button>
        )}
        {canEdit && (
          <button className="success" onClick={() => doAction("submit")}>
            Submit
          </button>
        )}
        {canActOnSubmitted && (
          <>
            <button className="success" onClick={() => doAction("approve")}>
              Approve
            </button>
            <input
              placeholder="Add a note for creator..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-[260px] !mb-0"
            />
            <button
              className="warning"
              onClick={() => doAction("return", { note })}
            >
              Return
            </button>
            <button
              className="danger"
              onClick={() => doAction("reject", { note })}
            >
              Reject
            </button>
          </>
        )}
        {canComplete && (
          <>
            <input
              placeholder="Transaction reference..."
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="w-[220px] !mb-0"
            />
            <button
              className="success"
              onClick={() => doAction("complete", { txnReference: txnRef })}
            >
              Mark Complete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
