export default function AllergensPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Allergen Information</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              At Nomad Stop, we take food allergies and dietary requirements very seriously. 
              Please inform our staff of any allergies when placing your order.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Allergens in Our Menu</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Gluten</h3>
                <p className="text-sm text-red-700">
                  Present in: Bread, naan, pizza bases, some sauces, and certain rice dishes.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Dairy</h3>
                <p className="text-sm text-blue-700">
                  Present in: Cheese, yoghurt, lassi, and some sauces.
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-2">Nuts</h3>
                <p className="text-sm text-amber-700">
                  Present in: Baklava, some desserts, and certain rice dishes.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Eggs</h3>
                <p className="text-sm text-green-700">
                  Present in: Some desserts and baked goods.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Notes</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Our kitchen handles multiple allergens. Cross-contamination may occur.</li>
              <li>Please inform us of any allergies when ordering.</li>
              <li>We cannot guarantee allergen-free preparation.</li>
              <li>If you have severe allergies, please speak to our staff before ordering.</li>
            </ul>

            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">Need Help?</h3>
              <p className="text-amber-700">
                If you have specific dietary requirements or allergies, please call us 
                at the number provided on our contact page, and we&apos;ll be happy to help 
                you choose suitable menu items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
