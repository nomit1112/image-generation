import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { preview } from '../assets';
import { getRandomPrompt } from '../utils';
import { FormField, Loader } from '../components';

const CreatePost = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    prompt: '',
    photo: '', // This will store the image URL string
  });

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  const generateImage = async () => {
    if (form.prompt) {
      try {
        setGeneratingImg(true);
        // Make the API call to your backend's /api/v1/dalle route
        const response = await fetch('http://localhost:8080/api/v1/dalle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: form.prompt,
          }),
        });

        // Parse the JSON response from the backend
        const data = await response.json();

        // Check if the response contains the 'photo' property (the image URL)
        if (response.ok && data.photo) { // Check response.ok for success status codes
          // Update the form state with the received image URL
          setForm({ ...form, photo: data.photo });
          console.log('Image URL received and state updated:', data.photo); // Add a log here

        } else {
          // Handle errors if backend response is not ok or no photo URL is received
          console.error('Image generation backend error:', data.message || 'Unknown error');
          alert(data.message || 'Image generation failed. Please try again.');
        }

      } catch (err) {
        // Handle network errors or other exceptions
        console.error('Error while generating image:', err);
        alert('Something went wrong while generating the image.');
      } finally {
        // Always set generatingImg to false after the process
        setGeneratingImg(false);
      }
    } else {
      // Alert if prompt is empty
      alert('Please provide a proper prompt');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.prompt && form.photo) {
      setLoading(true);
      try {
        // Make the API call to your backend's /api/v1/post route to share the post
        const response = await fetch('http://localhost:8080/api/v1/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...form }), // Send the form data including the image URL
        });

        // Check if the response is successful
        if (response.ok) {
          await response.json(); // Parse response if needed, or just check status
          alert('Success');
          navigate('/'); // Navigate to the homepage after successful submission
        } else {
          // Handle errors if backend response is not ok
           console.error('Post submission backend error:', response.status); // Log status
           const errorData = await response.json(); // Try to get error message from body
           console.error('Post submission backend error data:', errorData);
           alert(errorData.message || 'Something went wrong while sharing the image.');
        }

      } catch (err) {
        // Handle network errors or other exceptions during submission
        console.error('Error while submitting post:', err);
        alert('Something went wrong while sharing the image.');
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    } else {
      // Alert if image is not generated or prompt/name is missing before sharing
      alert('Please generate an image with proper details');
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Create</h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
          Generate an imaginative image through AI and share it with the community
        </p>
      </div>

      <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          {/* FormField for Name */}
          <FormField
            labelName="Your Name"
            type="text"
            name="name"
            placeholder="Ex., john doe"
            value={form.name}
            handleChange={handleChange}
          />

          {/* FormField for Prompt */}
          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="An Impressionist oil painting of sunflowers in a purple vase…"
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe
            handleSurpriseMe={handleSurpriseMe}
          />

          {/* Image Preview Area */}
          <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
            {/* Corrected Conditional Rendering using Ternary Operator */}
            {form.photo ? ( // If form.photo has a value (the image URL)
              <img
                src={form.photo} // Use the generated image URL
                alt={form.prompt}
                className="w-full h-full object-contain"
              />
            ) : ( // Otherwise (if form.photo is empty)
              <img
                src={preview} // Use the placeholder preview image
                alt="preview"
                className="w-9/12 h-9/12 object-contain opacity-40"
              />
            )}

            {/* Loader Overlay */}
            {generatingImg && (
              <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                <Loader />
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-5 flex gap-5">
          <button
            type="button"
            onClick={generateImage}
            className="text-white bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {generatingImg ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Share with the Community Section and Button */}
        <div className="mt-10">
          <p className="mt-2 text-[#666e75] text-[14px]">
            ** Once you have created the image you want, you can share it with others in the community **
          </p>
          <button
            type="submit"
            className="mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? 'Sharing...' : 'Share with the Community'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;