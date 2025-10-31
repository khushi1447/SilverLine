'use client';

export default function TestLogoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Logo Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Original Logo (Logo.jpeg):</h2>
            <img 
              src="/images/Logo.jpeg" 
              alt="SILVER LINE Logo" 
              className="h-20 w-auto border"
              onError={(e) => {
                console.error('Logo.jpeg failed to load:', e.currentTarget.src);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Backup Logo (logo.png):</h2>
            <img 
              src="/images/logo.png" 
              alt="SILVER LINE Logo Backup" 
              className="h-20 w-auto border"
              onError={(e) => {
                console.error('logo.png failed to load:', e.currentTarget.src);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">File Paths:</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• /images/Logo.jpeg</li>
              <li>• /images/logo.png</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
