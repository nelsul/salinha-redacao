/**
 * Salinha Produtiva - Interactive Canvas Essay Highlighter & Annotation Engine
 * Enables Prof.ª Cristine to highlight lines, draw annotations, and add comments on student essays.
 */

class EssayHighlighter {
  constructor(canvasContainerId, options = {}) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) throw new Error(`Container #${canvasContainerId} not found`);

    this.options = Object.assign({
      readOnly: false,
      initialAnnotations: [],
      onAnnotationChange: null,
      onAnnotationSelect: null
    }, options);

    this.annotations = JSON.parse(JSON.stringify(this.options.initialAnnotations || []));
    this.history = [];
    this.historyIndex = -1;

    this.activeTool = 'highlight'; // 'highlight' | 'brush' | 'comment' | 'eraser'
    this.activeColor = '#FBBF24'; // Yellow by default
    this.activeCompetency = 'Geral';
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.currentStroke = null;
    this.selectedAnnotation = null;

    this.img = new Image();
    this.imgLoaded = false;
    this.scale = 1.0;

    this.initDOM();
    this.saveState();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="highlighter-wrapper" style="position: relative; display: inline-block; user-select: none;">
        <canvas class="highlighter-bg-canvas" style="display: block; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"></canvas>
        <canvas class="highlighter-draw-canvas" style="position: absolute; top: 0; left: 0; cursor: crosshair;"></canvas>
        <div class="highlighter-comment-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
      </div>
    `;

    this.wrapper = this.container.querySelector('.highlighter-wrapper');
    this.bgCanvas = this.container.querySelector('.highlighter-bg-canvas');
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.drawCanvas = this.container.querySelector('.highlighter-draw-canvas');
    this.drawCtx = this.drawCanvas.getContext('2d');
    this.commentLayer = this.container.querySelector('.highlighter-comment-layer');

    this.bindEvents();
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      this.imgLoaded = false;
      this.img.crossOrigin = 'anonymous';
      this.img.onload = () => {
        this.imgLoaded = true;
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

    const baseWidth = Math.min(800, this.container.clientWidth - 20 || 800);
    const aspect = this.img.naturalHeight / this.img.naturalWidth;
    const baseHeight = baseWidth * aspect;

    this.width = baseWidth;
    this.height = baseHeight;

    // Retina support
    const dpr = window.devicePixelRatio || 1;
    this.bgCanvas.width = baseWidth * dpr;
    this.bgCanvas.height = baseHeight * dpr;
    this.bgCanvas.style.width = `${baseWidth}px`;
    this.bgCanvas.style.height = `${baseHeight}px`;
    this.bgCtx.scale(dpr, dpr);

    this.drawCanvas.width = baseWidth * dpr;
    this.drawCanvas.height = baseHeight * dpr;
    this.drawCanvas.style.width = `${baseWidth}px`;
    this.drawCanvas.style.height = `${baseHeight}px`;
    this.drawCtx.scale(dpr, dpr);

    // Natural to rendered coordinate ratio
    this.scaleX = baseWidth / this.img.naturalWidth;
    this.scaleY = baseHeight / this.img.naturalHeight;
  }

  bindEvents() {
    if (this.options.readOnly) {
      this.drawCanvas.style.cursor = 'default';
      return;
    }

    const getPos = (e) => {
      const rect = this.drawCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) / this.scaleX,
        y: (clientY - rect.top) / this.scaleY
      };
    };

    const onStart = (e) => {
      if (this.options.readOnly) return;
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
      if (!this.isDrawing || this.options.readOnly) return;
      this.isDrawing = false;
      this.drawCtx.clearRect(0, 0, this.width, this.height);

      if (this.activeTool === 'highlight') {
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : (e.clientX || 0);
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : (e.clientY || 0);
        const rect = this.drawCanvas.getBoundingClientRect();
        const endX = (clientX - rect.left) / this.scaleX;
        const endY = (clientY - rect.top) / this.scaleY;

        const x = Math.min(this.startX, endX);
        const y = Math.min(this.startY, endY);
        const w = Math.abs(endX - this.startX);
        const h = Math.abs(endY - this.startY);

        if (w > 15 && h > 8) {
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
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.drawCanvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    window.addEventListener('resize', () => {
      if (this.imgLoaded) {
        this.resizeCanvases();
        this.renderAll();
      }
    });
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

    // Draw background essay image
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
          this.bgCtx.fillRect(rx, ry - 14, Math.min(rw, 90), 14);
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
    // Optional comment directly attached to the highlighted block
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
    // Truncate redo stack if new action is taken
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
