"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase, saveLocation } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Use the new inline LocationPicker component
const LocationPicker = dynamic(
  () => import("@/components/location-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Map...</span>
      </div>
    )
  }
);

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  description: z.string().optional(),
  latitude: z.number({ required_error: "Please select a location" }),
  longitude: z.number({ required_error: "Please select a location" }),
});

export default function AddExchangePointPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const lat = watch("latitude");
  const lng = watch("longitude");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // alert("You must be logged in to add a point.");
        return;
      }

      await saveLocation(
        user.id,
        values.latitude,
        values.longitude,
        values.name,
        values.address,
        values.city,
        values.description
      );

      router.push("/exchange-points");
      router.refresh();
    } catch (error) {
      console.error(error);
      // alert("Failed to save location");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Add Exchange Point</CardTitle>
            <CardDescription>
              Share a safe location where book exchanges can happen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Central Library Entrance"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main St"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Karachi"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Details about meeting spot, availability, etc."
                  {...register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <div className="p-1 border rounded-md">
                  {/* Inline Map */}
                  <LocationPicker
                    initialPosition={null}
                    onLocationSelect={(coords) => {
                      setValue("latitude", coords.lat, { shouldValidate: true, shouldDirty: true });
                      setValue("longitude", coords.lng, { shouldValidate: true, shouldDirty: true });
                    }}
                    className="h-[400px] w-full"
                  />
                </div>
                {errors.latitude && (
                  <p className="text-sm text-destructive">Location is required - please click on the map to select a point.</p>
                )}
                {lat && lng && (
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    Selected: {lat.toFixed(5)}, {lng.toFixed(5)}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Exchange Point"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}