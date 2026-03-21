"""FiftyOne dataset management for CropGuard."""

import fiftyone as fo


def get_or_create_dataset() -> fo.Dataset:
    if fo.dataset_exists("cropguard"):
        return fo.load_dataset("cropguard")
    dataset = fo.Dataset("cropguard", persistent=True)
    dataset.description = "CropGuard — AI-powered crop disease detection and care"
    return dataset


def add_scan_sample(image_path: str, scan_id: str) -> fo.Sample:
    dataset = get_or_create_dataset()
    sample = fo.Sample(filepath=image_path)
    sample["scan_id"] = scan_id
    dataset.add_sample(sample)
    return sample


def attach_mask_to_sample(scan_id: str, mask_path: str) -> None:
    dataset = get_or_create_dataset()
    view = dataset.match(fo.ViewField("scan_id") == scan_id)
    if len(view) == 0:
        return
    sample = view.first()
    sample["segmentation_mask_path"] = mask_path
    sample.save()


def attach_diagnosis_to_sample(scan_id: str, diagnosis_dict: dict) -> None:
    dataset = get_or_create_dataset()
    view = dataset.match(fo.ViewField("scan_id") == scan_id)
    if len(view) == 0:
        return
    sample = view.first()

    disease = diagnosis_dict.get("disease", {})
    sample["crop_type"] = diagnosis_dict.get("crop_type", "Unknown")
    sample["disease_name"] = disease.get("name", "Unknown")
    sample["severity"] = disease.get("severity", "Unknown")
    sample["confidence"] = disease.get("confidence", 0.0)
    sample["affected_percent"] = disease.get("affected_percent", 0.0)
    sample["recovery_outlook"] = diagnosis_dict.get("recovery_outlook", "")

    if disease.get("name"):
        sample["classification"] = fo.Classification(
            label=disease["name"],
            confidence=disease.get("confidence", 0.0),
        )

    sample.save()
