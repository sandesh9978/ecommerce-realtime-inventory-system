import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "./context/ProductContext";
import { FaImage, FaPaperPlane } from "react-icons/fa";
import KhaltiCheckout from "khalti-checkout-web";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[()+,]/g, "")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

const defaultBlocks = [
  { type: "heading", level: 1, content: "Product Title" },
  { type: "image", src: "", alt: "Product image" },
  { type: "paragraph", content: "Product description goes here." },
];

function ContentBlock({ block, onEdit, onDelete, onMoveUp, onMoveDown, isAdmin, onImageUpload, onGalleryImageUpload, onRemoveGalleryImage, blockIndex }) {
  switch (block.type) {
    case "heading":
      return (
        <div className="mb-4">
          {isAdmin ? (
            <input
              type="text"
              value={block.content}
              onChange={e => onEdit({ ...block, content: e.target.value })}
              className="text-2xl font-bold w-full mb-1"
            />
          ) : (
            <h1 className="text-2xl font-bold mb-1">{block.content}</h1>
          )}
          {isAdmin && <BlockControls onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />}
        </div>
      );
    case "paragraph":
      return (
        <div className="mb-4">
          {isAdmin ? (
            <textarea
              value={block.content}
              onChange={e => onEdit({ ...block, content: e.target.value })}
              className="w-full p-2 border rounded mb-1"
              rows={3}
            />
          ) : (
            <p className="text-gray-700 mb-1">{block.content}</p>
          )}
          {isAdmin && <BlockControls onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />}
        </div>
      );
    case "image":
      return (
        <div className="mb-4 flex flex-col items-center">
          {block.images && block.images.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {block.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt={block.alt || `Image ${idx + 1}`} className="max-w-full h-64 object-contain mb-2" />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onEdit({ ...block, images: block.images.filter((_, i) => i !== idx) });
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-400 mb-2">No Image</div>
          )}
          {isAdmin && (
            <div className="w-full flex flex-col items-center mb-2">
              <label className="mb-1 font-semibold flex items-center gap-2 text-blue-700">
                <FaImage /> Upload Images
              </label>
              <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded p-3 w-full flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => onImageUpload(e, block)}
                  className="mb-1 hidden"
                  id={`upload-image-${block.alt || ''}`}
                />
                <label htmlFor={`upload-image-${block.alt || ''}`} className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                  <FaImage /> Choose Images
                </label>
              </div>
              <input
                type="text"
                value={block.alt || ""}
                onChange={e => onEdit({ ...block, alt: e.target.value })}
                placeholder="Image alt text"
                className="w-full p-1 border rounded mt-2"
              />
              {isAdmin && (
                <input
                  type="text"
                  value={block.caption || ""}
                  onChange={e => onEdit({ ...block, caption: e.target.value })}
                  placeholder="Image caption"
                  className="w-full p-1 border rounded mt-2"
                />
              )}
              <BlockControls onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
            </div>
          )}
        </div>
      );
    case "gallery":
      return (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {block.images && block.images.length > 0 ? (
              block.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={img.alt || "Gallery image"} className="w-32 h-32 object-cover rounded border" />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onRemoveGalleryImage(block, idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400">No images</div>
            )}
          </div>
          {isAdmin && (
            <div className="w-full flex flex-col items-center mb-2">
              <label className="mb-1 font-semibold flex items-center gap-2 text-blue-700">
                <FaImage /> Upload Images
              </label>
              <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded p-3 w-full flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => onGalleryImageUpload(e, blockIndex)}
                  className="mb-1 hidden"
                  id={`upload-gallery-${block.images?.length || 0}`}
                />
                <label htmlFor={`upload-gallery-${block.images?.length || 0}`} className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                  <FaImage /> Choose Images
                </label>
              </div>
              <BlockControls onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
            </div>
          )}
        </div>
      );
    case "list":
      return (
        <div className="mb-4">
          {isAdmin ? (
            <ul className="list-disc ml-6">
              {block.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={item}
                    onChange={e => {
                      const newItems = [...block.items];
                      newItems[idx] = e.target.value;
                      onEdit({ ...block, items: newItems });
                    }}
                    className="border p-1 rounded w-full"
                  />
                  <button type="button" onClick={() => {
                    const newItems = block.items.filter((_, i) => i !== idx);
                    onEdit({ ...block, items: newItems });
                  }} className="text-red-500">×</button>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => onEdit({ ...block, items: [...block.items, ""] })} className="text-xs bg-blue-100 px-2 py-1 rounded mt-1">+ Add Item</button>
              </li>
            </ul>
          ) : (
            <ul className="list-disc ml-6">
              {block.items.map((item, idx) => (
                <li key={idx}>
                  <button
                    className="hover:underline text-blue-600 bg-transparent border-none p-0 m-0 cursor-pointer"
                    style={{ background: "none" }}
                    onClick={() => alert(`You clicked: ${item}`)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {isAdmin && <BlockControls onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />}
        </div>
      );
    case "table":
      return (
        <div className="mb-4 overflow-x-auto">
          {isAdmin ? (
            <div>
              <table className="min-w-full border border-gray-300 mb-2">
                <tbody>
                  {block.rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="border px-2 py-1">
                          <input
                            type="text"
                            value={cell}
                            onChange={e => {
                              const newRows = block.rows.map(r => [...r]);
                              newRows[rowIdx][colIdx] = e.target.value;
                              onEdit({ ...block, rows: newRows });
                            }}
                            className="border p-1 rounded w-full"
                          />
                        </td>
                      ))}
                      <td>
                        <button type="button" onClick={() => {
                          const newRows = block.rows.filter((_, i) => i !== rowIdx);
                          onEdit({ ...block, rows: newRows });
                        }} className="text-red-500 ml-2">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => {
                  const cols = block.rows[0]?.length || 2;
                  onEdit({ ...block, rows: [...block.rows, Array(cols).fill("")] });
                }} className="text-xs bg-blue-100 px-2 py-1 rounded">+ Row</button>
                <button type="button" onClick={() => {
                  const newRows = block.rows.map(r => [...r, ""]);
                  onEdit({ ...block, rows: newRows });
                }} className="text-xs bg-blue-100 px-2 py-1 rounded">+ Col</button>
                <button type="button" onClick={() => {
                  if ((block.rows[0]?.length || 0) > 1) {
                    const newRows = block.rows.map(r => r.slice(0, -1));
                    onEdit({ ...block, rows: newRows });
                  }
                }} className="text-xs bg-red-100 px-2 py-1 rounded">- Col</button>
              </div>
              <BlockControls onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
            </div>
          ) : (
            <table className="min-w-full border border-gray-300">
              <tbody>
                {block.rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="border px-2 py-1">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    default:
      return null;
  }
}

function BlockControls({ onDelete, onMoveUp, onMoveDown }) {
  return (
    <div className="flex gap-2 mb-2">
      <button type="button" onClick={onMoveUp} className="px-2 py-1 bg-gray-200 rounded">↑</button>
      <button type="button" onClick={onMoveDown} className="px-2 py-1 bg-gray-200 rounded">↓</button>
      <button type="button" onClick={onDelete} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  let { products, setProducts } = useProducts();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";
  if (!products || products.length === 0) {
    try {
      const saved = localStorage.getItem("products");
      if (saved) products = JSON.parse(saved);
    } catch {}
  }
  const product = products.find(p => slugify(p.model) === slug);

  // Use blocks for content
  const [blocks, setBlocks] = useState(product?.blocks || defaultBlocks);
  const [editMode, setEditMode] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState({ message: null, error: false, loading: false });

  // Block operations
  const handleEditBlock = (idx, newBlock) => {
    setBlocks(blocks.map((b, i) => (b.id === newBlock.id ? newBlock : b)));
  };
  const handleDeleteBlock = idx => {
    setBlocks(blocks.filter((_, i) => i !== idx));
  };
  const handleMoveBlock = (idx, dir) => {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(idx, 1);
    newBlocks.splice(idx + dir, 0, moved);
    setBlocks(newBlocks);
  };
  const handleImageUpload = (e, block) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const readers = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(images => {
      setBlocks(blocks => {
        const idx = blocks.findIndex(b => b.id === block.id);
        // Remove images from the current block (if any)
        const newBlocks = [...blocks];
        newBlocks[idx] = { ...newBlocks[idx], images: [] };
        // Create a new image block for each uploaded image
        const imageBlocks = images.map(img => ({
          id: Date.now() + Math.random(),
          type: "image",
          images: [img],
          alt: "",
          caption: ""
        }));
        // Insert new image blocks after the current block
        newBlocks.splice(idx + 1, 0, ...imageBlocks);
        return newBlocks;
      });
      e.target.value = null;
    });
  };
  const handleGalleryImageUpload = (e, idx) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const readers = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ src: reader.result, alt: file.name });
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(images => {
      // No artificial limit: user can upload as many images as browser localStorage allows
      setBlocks(blocks => {
        const updated = blocks.map((b, i) =>
          i === idx ? { ...b, images: [...(b.images || []), ...images] } : b
        );
        // Debug: log the number of images in the gallery after upload
        if (updated[idx] && updated[idx].images) {
          console.log('Gallery images count:', updated[idx].images.length, updated[idx].images);
        }
        return updated;
      });
      e.target.value = null;
    });
  };
  const handleRemoveGalleryImage = (block, idx) => {
    setBlocks(blocks.map(b =>
      b === block ? { ...b, images: b.images.filter((_, i) => i !== idx) } : b
    ));
  };
  const handleAddBlock = (type, idx) => {
    let newBlock;
    const uniqueId = Date.now() + Math.random();
    if (type === "heading") newBlock = { id: uniqueId, type: "heading", level: 1, content: "New Heading" };
    if (type === "paragraph") newBlock = { id: uniqueId, type: "paragraph", content: "New paragraph." };
    if (type === "image") newBlock = { id: uniqueId, type: "image", images: [], alt: "", caption: "" };
    if (type === "gallery") newBlock = { id: uniqueId, type: "gallery", images: [] };
    if (type === "list") newBlock = { id: uniqueId, type: "list", items: ["List item 1"] };
    if (type === "table") newBlock = { id: uniqueId, type: "table", rows: [["Header 1", "Header 2"], ["Cell 1", "Cell 2"]] };
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, newBlock);
    setBlocks(newBlocks);
  };
  const handleSave = () => {
    setProducts(products.map(p =>
      p.id === product.id ? { ...p, blocks } : p
    ));
    setEditMode(false);
  };
  const handleCancel = () => {
    setBlocks(product?.blocks || defaultBlocks);
    setEditMode(false);
  };

  // Mock order save
  const handleBuy = (method) => {
    setOrderStatus({ message: null, error: false, loading: true });
    setTimeout(() => {
      setOrderStatus({ message: `Order placed with ${method}!`, error: false, loading: false });
      setShowBuyModal(false);
    }, 1200);
  };

  const handleKhaltiPayment = () => {
    const khaltiConfig = {
      publicKey: "test_public_key_dc74b7a36c6e47c6b4d33a446e4f69c7", // Replace with your real public key
      productIdentity: product.id.toString(),
      productName: product.model,
      productUrl: window.location.href,
      eventHandler: {
        onSuccess(payload) {
          alert("✅ Payment Successful!");
          // Save order logic here if needed
          setOrderStatus({ message: "Order placed with Khalti!", error: false, loading: false });
          setShowBuyModal(false);
        },
        onError(error) {
          alert("❌ Payment Failed. Please try again.");
          console.error("Khalti payment error:", error);
        },
        onClose() {
          console.log("Khalti widget closed.");
        },
      },
      paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
    };
    const checkout = new KhaltiCheckout(khaltiConfig);
    checkout.show({ amount: (product.price || 1000) * 100 }); // price in paisa
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products" className="text-blue-600 underline">Back to Products</Link>
      </div>
    );
  }

  const BACKEND_URL = "http://localhost:5000"; // Change if your backend runs elsewhere

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:underline">Products</Link>
          <span>/</span>
          <span className="text-black font-semibold">{product.model}</span>
        </nav>
        <div className="bg-white rounded-lg shadow p-8">
          {/* Product Images from local storage */}
          {product.images && product.images.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-6">
              {product.images.map((img) => (
                <img
                  key={img.id}
                  src={`http://localhost:5000/${img.image_path}`}
                  alt={product.model}
                  style={{ width: 200, height: 200, objectFit: "contain", borderRadius: 8, border: "1px solid #eee" }}
                />
              ))}
            </div>
          )}
          {isAdmin && !editMode && (
            <button onClick={() => setEditMode(true)} className="mb-4 bg-orange-600 text-white px-4 py-2 rounded">Edit Page</button>
          )}
          {editMode ? (
            <>
              {blocks.map((block, idx) => (
                <div key={idx} className="relative group border-b pb-4 mb-4">
                  <ContentBlock
                    block={block}
                    isAdmin={isAdmin}
                    onEdit={b => handleEditBlock(idx, b)}
                    onDelete={() => handleDeleteBlock(idx)}
                    onMoveUp={() => handleMoveBlock(idx, -1)}
                    onMoveDown={() => handleMoveBlock(idx, 1)}
                    onImageUpload={handleImageUpload}
                    onGalleryImageUpload={handleGalleryImageUpload}
                    onRemoveGalleryImage={handleRemoveGalleryImage}
                    blockIndex={idx}
                  />
                  {isAdmin && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleAddBlock("heading", idx)} className="text-xs bg-blue-100 px-2 py-1 rounded">+ Heading</button>
                      <button onClick={() => handleAddBlock("paragraph", idx)} className="text-xs bg-blue-100 px-2 py-1 rounded">+ Paragraph</button>
                      <button onClick={() => handleAddBlock("image", idx)} className="text-xs bg-blue-100 px-2 py-1 rounded">+ Image</button>
                      <button onClick={() => handleAddBlock("gallery", idx)} className="text-xs bg-blue-100 px-2 py-1 rounded">+ Gallery</button>
                      <button onClick={() => handleAddBlock("list", idx)} className="text-xs bg-blue-100 px-2 py-1 rounded">+ List</button>
                      <button onClick={() => handleAddBlock("table", idx)} className="text-xs bg-blue-100 px-2 py-1 rounded">+ Table</button>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2 mt-6">
                <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                <button onClick={handleCancel} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </>
          ) : (
            <>
              {blocks.map((block, idx) => {
                if (block.type === "gallery") {
                  return (
                    <div key={idx} className="mb-4 flex flex-wrap gap-2">
                      {block.images && block.images.length > 0 ? (
                        block.images.map((img, i) => (
                          <img key={i} src={img.src} alt={img.alt || "Gallery image"} className="w-32 h-32 object-cover rounded border" />
                        ))
                      ) : (
                        <div className="text-gray-400">No images</div>
                      )}
                    </div>
                  );
                }
                return <ContentBlock key={idx} block={block} isAdmin={false} />;
              })}
              {/* Buy Now Section */}
              <div className="mt-8 flex flex-col items-center">
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg flex items-center gap-2 shadow"
                >
                  <FaPaperPlane className="text-xl" />
                  {`Buy ${product.model} Here!`}
                </button>
                {orderStatus.message && <div className="mt-2 text-green-700 font-semibold">{orderStatus.message}</div>}
              </div>
              {/* Buy Modal */}
              {showBuyModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" role="dialog" aria-modal="true">
                  <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
                    <h3 className="text-xl font-semibold mb-4 text-center">Buy {product.model}</h3>
                    <button onClick={handleKhaltiPayment} className="w-full mb-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2">
                      <img src="https://khalti.com/static/icons/favicon-32x32.png" alt="Khalti" className="w-5 h-5" />
                      {`Pay for ${product.model} with Khalti`}
                    </button>
                    <button onClick={() => handleBuy("Cash on Delivery")} className="w-full bg-gray-900 hover:bg-black text-white px-4 py-2 rounded flex items-center justify-center gap-2">
                      <FaPaperPlane className="text-lg" />
                      {`Cash on Delivery for ${product.model}`}
                    </button>
                    <button onClick={() => setShowBuyModal(false)} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl">&times;</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
