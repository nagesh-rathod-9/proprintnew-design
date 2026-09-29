import fs from 'fs';
import path from 'path';
import { queryAll } from '../db.js';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export const getStoredUploadPath = (image: unknown): string | null => {
  if (typeof image !== 'string' || !image.trim()) return null;

  let pathname: string;
  try {
    pathname = new URL(image, 'http://localhost').pathname;
  } catch {
    return null;
  }

  const uploadsPrefix = '/uploads/';
  if (!pathname.startsWith(uploadsPrefix)) return null;

  let filename: string;
  try {
    filename = decodeURIComponent(pathname.slice(uploadsPrefix.length));
  } catch {
    return null;
  }

  if (!filename || filename.includes('/') || filename.includes('\\')) return null;

  const uploadPath = path.resolve(UPLOADS_DIR, filename);
  return path.dirname(uploadPath) === UPLOADS_DIR ? uploadPath : null;
};

const collectImageReferences = async (): Promise<string[]> => {
  const references: string[] = [];
  const add = (value: unknown) => {
    if (typeof value === 'string') references.push(value);
  };

  const heroSlides = await queryAll<{ image: string }>('SELECT image FROM hero_slides');
  heroSlides.forEach((row) => add(row.image));
  const categories = await queryAll<{ image: string }>('SELECT image FROM categories');
  categories.forEach((row) => add(row.image));
  const products = await queryAll<{ image: string; gallery_json: string }>('SELECT image, gallery_json FROM products');
  products.forEach((row) => {
    add(row.image);
    try {
      const gallery = JSON.parse(row.gallery_json || '[]');
      if (Array.isArray(gallery)) gallery.forEach(add);
    } catch (_error) {}
  });
  const portfolio = await queryAll<{ image: string }>('SELECT image FROM portfolio');
  portfolio.forEach((row) => add(row.image));

  return references;
};

export const removeUploadIfUnused = async (image: unknown) => {
  const uploadPath = getStoredUploadPath(image);
  if (!uploadPath) return;

  const stillReferenced = (await collectImageReferences()).some(
    (reference) => getStoredUploadPath(reference) === uploadPath
  );
  if (stillReferenced) return;

  fs.unlink(uploadPath, (error) => {
    if (error && error.code !== 'ENOENT') {
      console.warn(`Could not remove unused upload ${uploadPath}:`, error.message);
    }
  });
};

export const removeUploadsIfUnused = async (images: unknown[]) => {
  const uniqueImages = Array.from(new Set(images.filter(Boolean)));
  for (const image of uniqueImages) {
    await removeUploadIfUnused(image);
  }
};