import React from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import Header from '@/components/header/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


export default function sellform() {
  const { data, setData, post, processing, errors } = useForm<{
    product_name: string;
    product_price: string;
    product_desc: string;
    product_category: string;
    product_img: File | null;
  }>({
    product_name: '',
    product_price: '',
    product_desc: '',
    product_category: '',
    product_img: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('product_img', e.target.files[0]);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
  
    console.log("Resolved route:", route('products.store'));
    // 👉 Add this to verify if the image is being captured
    console.log("Image file before submission:", data.product_img);
  
    post(route('products.store'), {
      forceFormData: true,
    });
  };
  

  return (
    <>
      <Header />

      <Card className="max-w-xl mx-auto p-6 mt-10">
        <h1 className="text-3xl font-bold mb-6">List a New Product</h1>

        <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="product_name" className="block mb-1 font-medium">Product Name</label>
            <Input
              id="product_name"
              value={data.product_name}
              onChange={e => setData('product_name', e.target.value)}
              placeholder="Enter product name"
            />
            {errors.product_name && <p className="text-red-600 mt-1">{errors.product_name}</p>}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="product_price" className="block mb-1 font-medium">Price (RM)</label>
            <Input
              id="product_price"
              type="number"
              value={data.product_price}
              onChange={e => setData('product_price', e.target.value)}
              placeholder="Enter price"
              min={0}
            />
            {errors.product_price && <p className="text-red-600 mt-1">{errors.product_price}</p>}
          </div>

     {/* Category */}
     <div>
            <label htmlFor="product_category" className="block mb-1 font-medium">Category</label>
            <Select
              value={data.product_category}
              onValueChange={value => setData('product_category', value)}
            >
              <SelectTrigger id="product_category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                </SelectContent>
            </Select>
            {errors.product_category && <p className="text-red-600 mt-1">{errors.product_category}</p>}
          </div>


          {/* Description */}
            <div className="space-y-2">
            <Label htmlFor="product_desc">Description</Label>
            <Textarea
                id="product_desc"
                rows={4}
                value={data.product_desc}
                onChange={e => setData('product_desc', e.target.value)}
                placeholder="Enter product description"
            />
            {errors.product_desc && (
                <p className="text-sm text-red-600">{errors.product_desc}</p>
            )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
            <Label htmlFor="product_img">Upload Product Image</Label>
            <Input
                id="product_img"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            />
            {errors.product_img && (
                <p className="text-sm text-red-600">{errors.product_img}</p>
            )}
            </div>


            <Button asChild disabled={processing} className="w-full">
  <button
    type="submit"
    className={`w-full font-semibold text-white py-2 px-4 rounded-lg transition-all duration-300
      ${processing
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg'
      }`}
  >
    {processing ? 'Submitting...' : 'Submit Product'}
  </button>
</Button>


        </form>
      </Card>
    </>
  );
}
