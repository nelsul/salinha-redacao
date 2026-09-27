/**
 * Salinha Produtiva - Interactive Canvas Essay Highlighter & Annotation Engine
 * Enables Prof.ª Cristine to highlight lines, draw annotations, and add comments on student essays.
 * Supports smooth zooming, scrolling, panning (hand tool), and responsive high-DPI canvas rendering.
 */

class EssayHighlighter {
  constructor(canvasContainerId, options = {}) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) throw new Error(`Container #${canvasContainerId} not found`);

    this.options = Object.assign({
      readOnly: false,
      initialAnnotations: [],
      onAnnotationChange: null,
      onAnnotationSelect: null,
      onZoomChange: null,
      defaultZoom: 1.0
    }, options);

    this.annotations = JSON.parse(JSON.stringify(this.options.initialAnnotations || []));
    this.history = [];
    this.historyIndex = -1;

    this.activeTool = this.options.readOnly ? 'pan' : 'highlight'; // 'highlight' | 'brush' | 'comment' | 'eraser' | 'pan'
    this.activeColor = '#FBBF24'; // Yellow by default
    this.activeCompetency = 'Geral';
    this.isDrawing = false;
    this.isPanning = false;
    this.isSpacePressed = false;
    this.startX = 0;
    this.startY = 0;
    this.currentStroke = null;
    this.selectedAnnotation = null;

    this.img = new Image();
    this.imgLoaded = false;
    this.zoom = this.options.defaultZoom || 1.0;
    this.minZoom = 0.5;
    this.maxZoom = 2.5;
    this.baseWidth = 850; // Standard comfortable A4 width in pixels
    this.naturalWidth = 800;
    this.naturalHeight = 1130;

    this.initDOM();
    this.saveState();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="highlighter-wrapper">
        <canvas class="highlighter-bg-canvas"></canvas>
        <canvas class="highlighter-draw-canvas"></canvas>
        <div class="highlighter-comment-layer"></div>
      </div>
    `;

    this.wrapper = this.container.querySelector('.highlighter-wrapper');
    this.bgCanvas = this.container.querySelector('.highlighter-bg-canvas');
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.drawCanvas = this.container.querySelector('.highlighter-draw-canvas');
    this.drawCtx = this.drawCanvas.getContext('2d');
    this.commentLayer = this.container.querySelector('.highlighter-comment-layer');

    this.bindEvents();
    this.updateCursor();
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      this.imgLoaded = false;
      this.img.crossOrigin = 'anonymous';
      this.img.onload = () => {
        this.imgLoaded = true;
        this.naturalWidth = this.img.naturalWidth || 800;
        this.naturalHeight = this.img.naturalHeight || 1130;
        this.resizeCanvases();
        this.renderAll();
        resolve(this.img);
      };
      this.img.onerror = (err) => {
        console.error("Failed to load essay image", err);
        reject(err);
      };
      this.img.src = src;
    });
  }

  resizeCanvases() {
    if (!this.imgLoaded) return;

    const aspect = this.naturalHeight / this.naturalWidth;
    const renderedWidth = Math.round(this.baseWidth * this.zoom);
    const renderedHeight = Math.round(renderedWidth * aspect);

    this.width = renderedWidth;
    this.height = renderedHeight;

    // High-DPI (Retina) Canvas Support
    const dpr = window.devicePixelRatio || 1;
    this.bgCanvas.width = Math.round(renderedWidth * dpr);
    this.bgCanvas.height = Math.round(renderedHeight * dpr);
    this.bgCanvas.style.width = `${renderedWidth}px`;
    this.bgCanvas.style.height = `${renderedHeight}px`;
    this.bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.drawCanvas.width = Math.round(renderedWidth * dpr);
    this.drawCanvas.height = Math.round(renderedHeight * dpr);
    this.drawCanvas.style.width = `${renderedWidth}px`;
    this.drawCanvas.style.height = `${renderedHeight}px`;
    this.drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.wrapper.style.width = `${renderedWidth}px`;
    this.wrapper.style.height = `${renderedHeight}px`;
    this.commentLayer.style.width = `${renderedWidth}px`;
    this.commentLayer.style.height = `${renderedHeight}px`;

    // Natural to rendered coordinate ratio
    this.scaleX = renderedWidth / this.naturalWidth;
    this.scaleY = renderedHeight / this.naturalHeight;
  }

  setZoom(newZoom, anchorClientX = null, anchorClientY = null) {
    const clamped = Math.max(this.minZoom, Math.min(this.maxZoom, Math.round(newZoom * 100) / 100));
    if (Math.abs(clamped - this.zoom) < 0.005) return;

    const oldZoom = this.zoom;
    const scrollArea = this.container.closest('.canvas-scroll-area');

    let contentAnchorX = 0;
    let contentAnchorY = 0;
    let viewAnchorX = 0;
    let viewAnchorY = 0;

    if (scrollArea) {
      if (anchorClientX !== null && anchorClientY !== null) {
        const areaRect = scrollArea.getBoundingClientRect();
        viewAnchorX = anchorClientX - areaRect.left;
        viewAnchorY = anchorClientY - areaRect.top;
      } else {
        viewAnchorX = scrollArea.clientWidth / 2;
        viewAnchorY = scrollArea.clientHeight / 2;
      }
      contentAnchorX = scrollArea.scrollLeft + viewAnchorX;
      contentAnchorY = scrollArea.scrollTop + viewAnchorY;
    }

    this.zoom = clamped;
    this.resizeCanvases();
    this.renderAll();

    if (scrollArea && oldZoom > 0) {
      const scaleRatio = this.zoom / oldZoom;
      scrollArea.scrollLeft = Math.round(contentAnchorX * scaleRatio - viewAnchorX);
      scrollArea.scrollTop = Math.round(contentAnchorY * scaleRatio - viewAnchorY);
    }

    if (typeof this.options.onZoomChange === 'function') {
      this.options.onZoomChange(this.zoom);
    }
  }

  zoomIn(step = 0.15) {
    this.setZoom(this.zoom + step);
  }

  zoomOut(step = 0.15) {
    this.setZoom(this.zoom - step);
  }

  resetZoom() {
    this.setZoom(1.0);
  }

  fitWidth() {
    const scrollArea = this.container.closest('.canvas-scroll-area');
    if (scrollArea && scrollArea.clientWidth > 0) {
      const targetWidth = Math.max(500, scrollArea.clientWidth - 56);
      const targetZoom = Math.round((targetWidth / this.baseWidth) * 100) / 100;
      this.setZoom(targetZoom);
    } else {
      this.setZoom(1.0);
    }
  }

  getZoom() {
    return this.zoom;
  }

  getZoomPercent() {
    return `${Math.round(this.zoom * 100)}%`;
  }

  bindEvents() {
    const scrollArea = this.container.closest('.canvas-scroll-area') || this.container.parentElement;

    const getPos = (e) => {
      const rect = this.drawCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: Math.max(0, Math.min(this.naturalWidth, (clientX - rect.left) / this.scaleX)),
        y: Math.max(0, Math.min(this.naturalHeight, (clientY - rect.top) / this.scaleY))
      };
    };

    const isPanTrigger = (e) => {
      return this.activeTool === 'pan' || this.options.readOnly || this.isSpacePressed || e.button === 1;
    };

    const onStart = (e) => {
      if (isPanTrigger(e) || (e.button === 0 && this.activeTool === 'pan') || e.button === 1) {
        if (e.button === 2) return; // ignore right click
        this.isPanning = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.panStartX = clientX;
        this.panStartY = clientY;
        if (scrollArea) {
          this.panStartScrollLeft = scrollArea.scrollLeft;
          this.panStartScrollTop = scrollArea.scrollTop;
        }
        this.drawCanvas.style.cursor = 'grabbing';
        if (e.cancelable && e.type === 'touchstart') e.preventDefault();
        return;
      }

      if (this.options.readOnly) return;
      if (e.button !== 0 && !e.touches) return;

      const pos = getPos(e);
      this.isDrawing = true;
      this.startX = pos.x;
      this.startY = pos.y;

      if (this.activeTool === 'brush') {
        this.currentStroke = {
          id: 'str-' + Date.now(),
          type: 'brush',
          color: this.activeColor,
          width: 14,
          opacity: 0.45,
          points: [{ x: pos.x, y: pos.y }]
        };
      } else if (this.activeTool === 'comment') {
        this.isDrawing = false;
        this.promptComment(pos.x, pos.y);
      } else if (this.activeTool === 'eraser') {
        this.isDrawing = false;
        this.eraseAt(pos.x, pos.y);
      }
    };

    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (this.isPanning && scrollArea) {
        const dx = clientX - this.panStartX;
        const dy = clientY - this.panStartY;
        scrollArea.scrollLeft = this.panStartScrollLeft - dx;
        scrollArea.scrollTop = this.panStartScrollTop - dy;
        return;
      }

      if (!this.isDrawing || this.options.readOnly) return;
      const pos = getPos(e);

      if (this.activeTool === 'highlight') {
        this.drawHighlightPreview(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
      } else if (this.activeTool === 'brush' && this.currentStroke) {
        this.currentStroke.points.push({ x: pos.x, y: pos.y });
        this.drawBrushPreview(this.currentStroke);
      }
    };

    const onEnd = (e) => {
      if (this.isPanning) {
        this.isPanning = false;
        this.updateCursor();
        return;
      }

      if (!this.isDrawing || this.options.readOnly) return;
      this.isDrawing = false;
      this.drawCtx.clearRect(0, 0, this.width, this.height);

      if (this.activeTool === 'highlight') {
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : (e.clientX || 0);
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : (e.clientY || 0);
        const rect = this.drawCanvas.getBoundingClientRect();
        const endX = Math.max(0, Math.min(this.naturalWidth, (clientX - rect.left) / this.scaleX));
        const endY = Math.max(0, Math.min(this.naturalHeight, (clientY - rect.top) / this.scaleY));

        const x = Math.min(this.startX, endX);
        const y = Math.min(this.startY, endY);
        const w = Math.abs(endX - this.startX);
        const h = Math.abs(endY - this.startY);

        if (w > 12 && h > 6) {
          const ann = {
            id: 'hl-' + Date.now(),
            type: 'highlight',
            x, y, w, h,
            color: this.activeColor,
            label: this.activeCompetency || 'Destaque',
            comment: ''
          };
          this.annotations.push(ann);
          this.saveState();
          this.renderAll();
          this.promptAnnotationDetails(ann);
        }
      } else if (this.activeTool === 'brush' && this.currentStroke) {
        if (this.currentStroke.points.length > 1) {
          this.annotations.push(this.currentStroke);
          this.saveState();
          this.renderAll();
        }
        this.currentStroke = null;
      }
    };

    this.drawCanvas.addEventListener('mousedown', onStart);
    this._onWindowMouseMove = onMove;
    this._onWindowMouseUp = onEnd;
    window.addEventListener('mousemove', this._onWindowMouseMove);
    window.addEventListener('mouseup', this._onWindowMouseUp);

    this.drawCanvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', this._onWindowMouseMove, { passive: false });
    window.addEventListener('touchend', this._onWindowMouseUp);

    // Ctrl + Mouse Wheel Zoom or Pinch
    if (scrollArea) {
      this._onWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const zoomDelta = e.deltaY < 0 ? 0.12 : -0.12;
          this.setZoom(this.zoom + zoomDelta, e.clientX, e.clientY);
        }
      };
      scrollArea.addEventListener('wheel', this._onWheel, { passive: false });
    }

    // Spacebar temporary pan mode & Keyboard zoom shortcuts (+ / - / 0)
    this._onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' && !this.isSpacePressed) {
        this.isSpacePressed = true;
        this.drawCanvas.style.cursor = 'grab';
        e.preventDefault();
      } else if ((e.key === '+' || e.key === '=') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.zoomIn();
      } else if ((e.key === '-' || e.key === '_') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.zoomOut();
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.resetZoom();
      }
    };

    this._onKeyUp = (e) => {
      if (e.code === 'Space') {
        this.isSpacePressed = false;
        this.updateCursor();
      }
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    this._onResize = () => {
      if (this.imgLoaded) {
        this.resizeCanvases();
        this.renderAll();
      }
    };
    window.addEventListener('resize', this._onResize);
  }

  destroy() {
    if (this._onWindowMouseMove) {
      window.removeEventListener('mousemove', this._onWindowMouseMove);
      window.removeEventListener('touchmove', this._onWindowMouseMove);
    }
    if (this._onWindowMouseUp) {
      window.removeEventListener('mouseup', this._onWindowMouseUp);
      window.removeEventListener('touchend', this._onWindowMouseUp);
    }
    if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
    if (this._onKeyUp) window.removeEventListener('keyup', this._onKeyUp);
    if (this._onResize) window.removeEventListener('resize', this._onResize);

    const scrollArea = this.container.closest('.canvas-scroll-area');
    if (scrollArea && this._onWheel) {
      scrollArea.removeEventListener('wheel', this._onWheel);
    }
  }

  drawHighlightPreview(x, y, w, h) {
    this.drawCtx.clearRect(0, 0, this.width, this.height);
    this.drawCtx.save();
    this.drawCtx.fillStyle = this.hexToRgba(this.activeColor, 0.35);
    this.drawCtx.strokeStyle = this.activeColor;
    this.drawCtx.lineWidth = 1.5;
    this.drawCtx.fillRect(x * this.scaleX, y * this.scaleY, w * this.scaleX, h * this.scaleY);
    this.drawCtx.strokeRect(x * this.scaleX, y * this.scaleY, w * this.scaleX, h * this.scaleY);
    this.drawCtx.restore();
  }

  drawBrushPreview(stroke) {
    this.drawCtx.save();
    this.drawCtx.strokeStyle = this.hexToRgba(stroke.color, stroke.opacity);
    this.drawCtx.lineWidth = stroke.width * this.scaleX;
    this.drawCtx.lineCap = 'round';
    this.drawCtx.lineJoin = 'round';

    this.drawCtx.beginPath();
    const pts = stroke.points;
    if (pts.length > 0) {
      this.drawCtx.moveTo(pts[0].x * this.scaleX, pts[0].y * this.scaleY);
      for (let i = 1; i < pts.length; i++) {
        this.drawCtx.lineTo(pts[i].x * this.scaleX, pts[i].y * this.scaleY);
      }
    }
    this.drawCtx.stroke();
    this.drawCtx.restore();
  }

  renderAll() {
    if (!this.imgLoaded) return;

    // Draw background essay sheet image
    this.bgCtx.clearRect(0, 0, this.width, this.height);
    this.bgCtx.drawImage(this.img, 0, 0, this.width, this.height);

    // Render highlights and brush strokes
    this.annotations.forEach(ann => {
      if (ann.type === 'highlight') {
        this.bgCtx.save();
        this.bgCtx.fillStyle = this.hexToRgba(ann.color, 0.40);
        this.bgCtx.strokeStyle = ann.color;
        this.bgCtx.lineWidth = 1.5;
        const rx = ann.x * this.scaleX;
        const ry = ann.y * this.scaleY;
        const rw = ann.w * this.scaleX;
        const rh = ann.h * this.scaleY;

        this.bgCtx.fillRect(rx, ry, rw, rh);
        this.bgCtx.strokeRect(rx, ry, rw, rh);

        // Competency tag badge on top corner
        if (ann.label) {
          this.bgCtx.fillStyle = ann.color;
          const badgeW = Math.min(rw, 95);
          this.bgCtx.fillRect(rx, ry - 14, badgeW, 14);
          this.bgCtx.fillStyle = '#ffffff';
          this.bgCtx.font = 'bold 9px Inter, sans-serif';
          this.bgCtx.fillText(ann.label.substring(0, 14), rx + 4, ry - 3);
        }
        this.bgCtx.restore();
      } else if (ann.type === 'brush') {
        this.bgCtx.save();
        this.bgCtx.strokeStyle = this.hexToRgba(ann.color, ann.opacity || 0.45);
        this.bgCtx.lineWidth = (ann.width || 14) * this.scaleX;
        this.bgCtx.lineCap = 'round';
        this.bgCtx.lineJoin = 'round';
        this.bgCtx.beginPath();
        const pts = ann.points || [];
        if (pts.length > 0) {
          this.bgCtx.moveTo(pts[0].x * this.scaleX, pts[0].y * this.scaleY);
          for (let i = 1; i < pts.length; i++) {
            this.bgCtx.lineTo(pts[i].x * this.scaleX, pts[i].y * this.scaleY);
          }
        }
        this.bgCtx.stroke();
        this.bgCtx.restore();
      }
    });

    this.renderCommentMarkers();

    if (typeof this.options.onAnnotationChange === 'function') {
      this.options.onAnnotationChange(this.annotations);
    }
  }

  renderCommentMarkers() {
    this.commentLayer.innerHTML = '';
    const comments = this.annotations.filter(a => a.type === 'comment' || (a.comment && a.comment.trim() !== ''));

    comments.forEach((ann, idx) => {
      const marker = document.createElement('div');
      marker.className = 'canvas-comment-marker';
      const x = (ann.x || ann.x + ann.w) * this.scaleX;
      const y = (ann.y) * this.scaleY;

      marker.style.position = 'absolute';
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      marker.style.transform = 'translate(-50%, -50%)';
      marker.style.zIndex = '15';
      marker.style.pointerEvents = 'auto';
      marker.style.cursor = 'pointer';

      marker.innerHTML = `
        <div class="marker-pill" style="background: ${ann.color || '#F59E0B'}; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: 2px solid #fff; transition: transform 0.2s;">
          ${idx + 1}
        </div>
        <div class="marker-popup" style="display: none; position: absolute; left: 32px; top: -10px; width: 220px; background: #ffffff; color: #1e1b4b; padding: 10px 12px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.18); border-left: 4px solid ${ann.color || '#F59E0B'}; font-size: 12px; line-height: 1.4; z-index: 20;">
          <div style="font-weight: 700; color: #581C87; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>Prof.ª Cristine</span>
            <span style="font-size: 10px; color: #6b7280;">Dica</span>
          </div>
          <div>${ann.comment || 'Ponto de atenção na redação.'}</div>
          ${!this.options.readOnly ? `<button class="delete-ann-btn" style="margin-top: 6px; font-size: 10px; color: #ef4444; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0;">Remover nota</button>` : ''}
        </div>
      `;

      const pill = marker.querySelector('.marker-pill');
      const popup = marker.querySelector('.marker-popup');

      marker.addEventListener('mouseenter', () => {
        popup.style.display = 'block';
        pill.style.transform = 'scale(1.15)';
      });

      marker.addEventListener('mouseleave', () => {
        popup.style.display = 'none';
        pill.style.transform = 'scale(1)';
      });

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
      });

      const delBtn = marker.querySelector('.delete-ann-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeAnnotation(ann.id);
        });
      }

      this.commentLayer.appendChild(marker);
    });
  }

  promptComment(x, y) {
    const comment = prompt('Observação da Prof.ª Cristine para o aluno:');
    if (comment && comment.trim() !== '') {
      this.annotations.push({
        id: 'cm-' + Date.now(),
        type: 'comment',
        x, y,
        color: this.activeColor,
        comment: comment.trim()
      });
      this.saveState();
      this.renderAll();
    }
  }

  promptAnnotationDetails(ann) {
    const comment = prompt('Comentário ou dica para este trecho destacado (opcional):');
    if (comment && comment.trim() !== '') {
      ann.comment = comment.trim();
      this.saveState();
      this.renderAll();
    }
  }

  eraseAt(x, y) {
    const idx = this.annotations.findIndex(a => {
      if (a.type === 'highlight') {
        return x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h;
      } else if (a.type === 'comment') {
        return Math.hypot(x - a.x, y - a.y) < 25;
      } else if (a.type === 'brush' && a.points) {
        return a.points.some(p => Math.hypot(x - p.x, y - p.y) < 20);
      }
      return false;
    });

    if (idx !== -1) {
      this.annotations.splice(idx, 1);
      this.saveState();
      this.renderAll();
    }
  }

  removeAnnotation(id) {
    this.annotations = this.annotations.filter(a => a.id !== id);
    this.saveState();
    this.renderAll();
  }

  clear() {
    if (confirm('Deseja limpar todas as marcações desta redação?')) {
      this.annotations = [];
      this.saveState();
      this.renderAll();
    }
  }

  saveState() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.annotations)));
    this.historyIndex++;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.annotations = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.renderAll();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.annotations = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.renderAll();
    }
  }

  setTool(tool) {
    this.activeTool = tool;
    this.updateCursor();
  }

  updateCursor() {
    if (this.options.readOnly) {
      this.drawCanvas.style.cursor = this.isPanning ? 'grabbing' : 'grab';
      return;
    }
    if (this.activeTool === 'pan') {
      this.drawCanvas.style.cursor = this.isPanning ? 'grabbing' : 'grab';
    } else if (this.activeTool === 'comment') {
      this.drawCanvas.style.cursor = 'pointer';
    } else if (this.activeTool === 'eraser') {
      this.drawCanvas.style.cursor = 'cell';
    } else {
      this.drawCanvas.style.cursor = 'crosshair';
    }
  }

  setColor(color, label = '') {
    this.activeColor = color;
    this.activeCompetency = label;
  }

  getAnnotations() {
    return JSON.parse(JSON.stringify(this.annotations));
  }

  setAnnotations(annotations) {
    this.annotations = JSON.parse(JSON.stringify(annotations || []));
    this.saveState();
    this.renderAll();
  }

  hexToRgba(hex, alpha = 1) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

window.EssayHighlighter = EssayHighlighter;
