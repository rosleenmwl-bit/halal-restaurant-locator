"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Delete this restaurant from the public directory?")) {
          event.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
