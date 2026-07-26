const ITEMS = [
  { key: 'house', label: 'Pond nest', emoji: '🏠', cost: 10 },
  { key: 'hat', label: 'Rain hat', emoji: '🎩', cost: 5 },
  { key: 'scarf', label: 'Cozy scarf', emoji: '🧣', cost: 5 },
  { key: 'garden', label: 'Lily garden', emoji: '🌸', cost: 15 }
]

export default function ShopModal({ open, onClose, weeds, owned, onBuy }) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-wobble bg-textDark/40">
      <div className="w-[250px] rounded-wobble bg-cream p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-lg font-bold">Shop</div>
          <button onClick={onClose} className="px-2 text-lg text-textMuted">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ITEMS.map((item) => {
            const isOwned = owned.includes(item.key)
            const canAfford = weeds >= item.cost
            return (
              <div key={item.key} className="rounded-wobble border-2 border-border p-2 text-center">
                <div className="text-2xl">{item.emoji}</div>
                <div className="text-xs font-bold">{item.label}</div>
                <button
                  disabled={isOwned}
                  onClick={() => onBuy(item.key, item.cost)}
                  className={`mt-1 w-full rounded-wobble px-2 py-1 text-xs font-semibold ${
                    isOwned
                      ? 'bg-leaf text-leafText'
                      : canAfford
                        ? 'bg-blossom text-white'
                        : 'bg-blossom/60 text-white'
                  }`}
                >
                  {isOwned ? 'Owned ✓' : `🌿 ${item.cost}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
