import React, { useState, useEffect } from 'react';
import { HERO_CLASSES } from '../../data/heroes';
import { MODDED_HERO_CLASSES } from '../../data/modded_heroes';
import { TRINKETS } from '../../data/trinkets';
import { BACKER_TRINKETS } from '../../data/backer_trinkets';
import { getHeroImagePath, getSkillImagePath, getCampSkillImagePath, getTrinketImagePath } from '../../utils/imageHelper';

const ImageTester = ({ onClose }) => {
  const [results, setResults] = useState({ loaded: 0, failed: 0, total: 0 });
  const [failedImages, setFailedImages] = useState([]);
  const [testing, setTesting] = useState(true);
  const [filter, setFilter] = useState('all'); // all, failed, heroes, skills, camp, trinkets

  // Recopilar todas las imágenes
  const allImages = [];

  // Heroes
  Object.keys(HERO_CLASSES).forEach(heroClass => {
    allImages.push({ 
      type: 'hero', 
      name: heroClass, 
      url: getHeroImagePath(heroClass) 
    });
    
    // Skills
    HERO_CLASSES[heroClass].skills?.forEach(skill => {
      allImages.push({ 
        type: 'skill', 
        name: `${heroClass} - ${skill}`, 
        url: getSkillImagePath(skill, heroClass) 
      });
    });
    
    // Camp Skills
    HERO_CLASSES[heroClass].campSkills?.forEach(skill => {
      allImages.push({ 
        type: 'camp', 
        name: `${heroClass} - ${skill}`, 
        url: getCampSkillImagePath(skill, heroClass) 
      });
    });
  });

  // Modded Heroes
  Object.keys(MODDED_HERO_CLASSES).forEach(heroClass => {
    allImages.push({ 
      type: 'hero', 
      name: `[MOD] ${heroClass}`, 
      url: getHeroImagePath(heroClass) 
    });
    
    MODDED_HERO_CLASSES[heroClass].skills?.forEach(skill => {
      allImages.push({ 
        type: 'skill', 
        name: `[MOD] ${heroClass} - ${skill}`, 
        url: getSkillImagePath(skill, heroClass) 
      });
    });
    
    MODDED_HERO_CLASSES[heroClass].campSkills?.forEach(skill => {
      allImages.push({ 
        type: 'camp', 
        name: `[MOD] ${heroClass} - ${skill}`, 
        url: getCampSkillImagePath(skill, heroClass) 
      });
    });
  });

  // Trinkets
  TRINKETS.forEach(trinket => {
    allImages.push({ 
      type: 'trinket', 
      name: trinket, 
      url: getTrinketImagePath(trinket) 
    });
  });

  // Backer Trinkets (use same function - it detects backer trinkets internally)
  BACKER_TRINKETS.forEach(trinket => {
    allImages.push({ 
      type: 'trinket', 
      name: `[BACKER] ${trinket}`, 
      url: getTrinketImagePath(trinket) 
    });
  });

  const [imageStatuses, setImageStatuses] = useState(
    allImages.map(img => ({ ...img, status: 'pending' }))
  );

  useEffect(() => {
    let loaded = 0;
    let failed = 0;
    const failed_list = [];

    const checkImage = (img, index) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          loaded++;
          setImageStatuses(prev => {
            const newStatuses = [...prev];
            newStatuses[index] = { ...newStatuses[index], status: 'loaded' };
            return newStatuses;
          });
          setResults({ loaded, failed, total: allImages.length });
          resolve();
        };
        image.onerror = () => {
          failed++;
          failed_list.push(img);
          setImageStatuses(prev => {
            const newStatuses = [...prev];
            newStatuses[index] = { ...newStatuses[index], status: 'failed' };
            return newStatuses;
          });
          setFailedImages([...failed_list]);
          setResults({ loaded, failed, total: allImages.length });
          resolve();
        };
        image.src = img.url;
      });
    };

    // Test images in batches to avoid overwhelming the browser
    const testBatch = async (startIdx, batchSize) => {
      const promises = [];
      for (let i = startIdx; i < Math.min(startIdx + batchSize, allImages.length); i++) {
        promises.push(checkImage(allImages[i], i));
      }
      await Promise.all(promises);
      
      if (startIdx + batchSize < allImages.length) {
        setTimeout(() => testBatch(startIdx + batchSize, batchSize), 100);
      } else {
        setTesting(false);
      }
    };

    testBatch(0, 20);
  }, []);

  const filteredImages = imageStatuses.filter(img => {
    if (filter === 'all') return true;
    if (filter === 'failed') return img.status === 'failed';
    if (filter === 'heroes') return img.type === 'hero';
    if (filter === 'skills') return img.type === 'skill';
    if (filter === 'camp') return img.type === 'camp';
    if (filter === 'trinkets') return img.type === 'trinket';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-auto p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-700 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-dd-gold font-darkest">Image Tester</h2>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white"
            >
              Close
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 mb-4 text-lg">
            <span className="text-gray-400">
              Total: <span className="text-white font-bold">{allImages.length}</span>
            </span>
            <span className="text-green-400">
              ✓ Loaded: <span className="font-bold">{results.loaded}</span>
            </span>
            <span className="text-red-400">
              ✗ Failed: <span className="font-bold">{results.failed}</span>
            </span>
            {testing && (
              <span className="text-yellow-400 animate-pulse">Testing...</span>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'failed', 'heroes', 'skills', 'camp', 'trinkets'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm ${
                  filter === f 
                    ? 'bg-dd-gold text-gray-900' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'failed' && results.failed > 0 && (
                  <span className="ml-1 text-red-500">({results.failed})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-4">
          {filteredImages.map((img, idx) => (
            <div 
              key={idx}
              className={`relative p-1 rounded border-2 ${
                img.status === 'loaded' ? 'border-green-600 bg-green-900/20' :
                img.status === 'failed' ? 'border-red-600 bg-red-900/40' :
                'border-gray-600 bg-gray-800'
              }`}
              title={`${img.name}\n${img.url}`}
            >
              <img 
                src={img.url}
                alt={img.name}
                className="w-full h-12 object-contain"
                onError={(e) => e.target.style.opacity = 0.3}
              />
              <div className="text-[8px] text-center truncate text-gray-400 mt-1">
                {img.name.split(' - ').pop()}
              </div>
              {img.status === 'failed' && (
                <div className="absolute inset-0 flex items-center justify-center text-red-500 text-2xl">
                  ✗
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Failed Images List */}
        {failedImages.length > 0 && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded">
            <h3 className="text-red-400 font-bold mb-2">Failed Images ({failedImages.length}):</h3>
            <div className="max-h-60 overflow-y-auto text-sm">
              {failedImages.map((img, idx) => (
                <div key={idx} className="text-red-300 py-1 border-b border-red-900/50">
                  <span className="text-red-500">[{img.type}]</span> {img.name}
                  <div className="text-red-400/60 text-xs truncate">{img.url}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageTester;
