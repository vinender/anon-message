// components/ShareButtons.jsx (Create this new file)
import React from 'react';
import { FiShare2 } from 'react-icons/fi';
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'; // Import necessary icons

const ShareButtons = ({ shareUrl, userName }) => {
  if (!shareUrl) {
    return null; // Don't render if the URL isn't ready
  }

  const shareText = `Send ${userName || 'me'} an anonymous message using AnonMessage!`; // Customize your message
  const encodedShareText = encodeURIComponent(shareText);
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const via = "EncryptMSG"; // Optional: Your app's Twitter handle

  // --- Social Media Links ---
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareText}${via ? `&via=${via}` : ''}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedShareText}%20${encodedShareUrl}`; // Text and URL separated by space

  // --- Web Share API Handler ---
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Send an anonymous message to ${userName || 'me'}`,
          text: shareText,
          url: shareUrl,
        });
        console.log('Successful share using Web Share API');
      } catch (error) {
        console.error('Error sharing using Web Share API:', error);
        // Optionally fallback to showing links if native share fails unexpectedly
      }
    } else {
      console.log('Web Share API not supported, showing fallback links.');
      // Maybe open a specific link or just rely on the visible link buttons
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <>
      {/* Optional: A primary share button using Web Share API if available */}
      {hasNativeShare && (
         <button
            onClick={handleNativeShare}
            className="w-full mb-4 flex items-center justify-center gap-2 py-2 px-4 bg-teal-500 hover:bg-teal-600 rounded-lg text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500"
          >
            <FiShare2 className="h-5 w-5" />
            <span>Share Link</span>
          </button>
      )}

      {/* Fallback Links / Always Visible Links */}
      <div className="flex justify-between items-center">
         <span className="text-sm text-slate-300">
             {hasNativeShare ? 'Or share via:' : 'Share on social media:'}
         </span>
        <div className="flex space-x-2">
          {/* Twitter */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Twitter"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition text-[#1DA1F2]"
          >
            <FaTwitter className="h-4 w-4" />
          </a>
          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Facebook"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition text-[#4267B2]" // Use actual FB blue
          >
            <FaFacebookF className="h-4 w-4" />
          </a>
          {/* LinkedIn */}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on LinkedIn"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition text-[#0A66C2]" // Use actual LinkedIn blue
          >
            <FaLinkedinIn className="h-4 w-4" />
          </a>
           {/* WhatsApp */}
           <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on WhatsApp"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition text-[#25D366]" // Use actual WhatsApp green
          >
            <FaWhatsapp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </>
  );
};

export default ShareButtons;