import os
from PIL import Image
import numpy as np
import tensorflow as tf

class CropDiseasePipeline:
    def __init__(self, rice_model_path, wheat_model_path, rice_labels, wheat_labels):
        print("[INFO] Initializing Crop Disease Pipeline...")

        self.rice_model = tf.keras.models.load_model(rice_model_path)
        self.wheat_model = tf.keras.models.load_model(wheat_model_path)

        self.rice_labels = rice_labels
        self.wheat_labels = wheat_labels

        print("[SUCCESS] Models loaded successfully")

    def _preprocess(self, image: Image.Image):
        img = image.resize((224, 224))
        img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0
        return np.expand_dims(img_array, axis=0)

    def run_inference_image(self, image: Image.Image, preferred_crop: str = None):
        """
        Runs disease classification on a PIL Image.
        If preferred_crop ('Rice' or 'Wheat') is provided, it prioritizes that model.
        Otherwise, it evaluates both models and chooses the one with higher confidence.
        """
        img_array = self._preprocess(image)

        rice_preds = self.rice_model.predict(img_array, verbose=0)[0]
        wheat_preds = self.wheat_model.predict(img_array, verbose=0)[0]

        rice_conf = float(np.max(rice_preds))
        wheat_conf = float(np.max(wheat_preds))

        if preferred_crop and preferred_crop.lower() == "rice":
            crop_name = "Rice"
            best_idx = int(np.argmax(rice_preds))
            disease_name = self.rice_labels[best_idx]
            disease_conf = rice_conf
        elif preferred_crop and preferred_crop.lower() == "wheat":
            crop_name = "Wheat"
            best_idx = int(np.argmax(wheat_preds))
            disease_name = self.wheat_labels[best_idx]
            disease_conf = wheat_conf
        else:
            if rice_conf >= wheat_conf:
                crop_name = "Rice"
                best_idx = int(np.argmax(rice_preds))
                disease_name = self.rice_labels[best_idx]
                disease_conf = rice_conf
            else:
                crop_name = "Wheat"
                best_idx = int(np.argmax(wheat_preds))
                disease_name = self.wheat_labels[best_idx]
                disease_conf = wheat_conf

        is_healthy = "healthy" in disease_name.lower()

        return {
            "status": "Success",
            "crop": crop_name,
            "disease": disease_name,
            "disease_confidence": f"{disease_conf:.2%}",
            "confidence_score": round(disease_conf, 4),
            "is_healthy": is_healthy
        }

    def run_inference(self, image_path: str, preferred_crop: str = None):
        if not os.path.exists(image_path):
            return {"status": "Error", "error": f"File not found: {image_path}"}

        image = Image.open(image_path).convert("RGB")
        return self.run_inference_image(image, preferred_crop=preferred_crop)


if __name__ == "__main__":
    RICE_DISEASES = [
        "Bacterial Leaf Blight",
        "Brown Spot",
        "Healthy Rice Leaf",
        "Leaf Blast",
        "Leaf scald",
        "Sheath Blight"
    ]
    WHEAT_DISEASES = [
        "Aphid",
        "Black Rust",
        "Blast",
        "Brown Rust",
        "Common Root Rot",
        "Fusarium Head Blight",
        "Healthy",
        "Leaf Blight",
        "Mildew",
        "Mite",
        "Septoria",
        "Smut",
        "Stem fly",
        "Tan spot",
        "Yellow Rust"
    ]

    pipeline = CropDiseasePipeline(
        rice_model_path="model/rice_model.h5",
        wheat_model_path="model/wheat_model.h5",
        rice_labels=RICE_DISEASES,
        wheat_labels=WHEAT_DISEASES
    )

    test_image_dir = "Rice/Leaf Blast"
    if os.path.exists(test_image_dir):
        files = os.listdir(test_image_dir)
        if files:
            sample = os.path.join(test_image_dir, files[0])
            print("Testing with sample:", sample)
            result = pipeline.run_inference(sample)
            print("\n--- FINAL RESULT ---")
            print(result)