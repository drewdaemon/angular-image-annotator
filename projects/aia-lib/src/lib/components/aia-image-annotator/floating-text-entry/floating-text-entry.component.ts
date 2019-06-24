import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'aia-floating-text-entry',
  templateUrl: './floating-text-entry.component.html',
  styleUrls: ['./floating-text-entry.component.scss']
})
export class FloatingTextEntryComponent implements OnInit {

    public currentText = '';
    private borderWidth = 2;

    @ViewChild('textBox') textBoxRef: ElementRef;
    @ViewChild('p') pRef: ElementRef;
    @ViewChild('input') inputRef: ElementRef;

    ngOnInit() {
        this.textBoxRef.nativeElement.style.borderWidth = this.borderWidth + 'px';
    }

    public getText(): string {
        return this.currentText;
    }

    public hide(): void {
        this.textBoxRef.nativeElement.style.display = 'none';
    }

    public show(): void {
        this.textBoxRef.nativeElement.style.display = 'block';
    }

    public setFont(fontStr: string) {
        this.textBoxRef.nativeElement.style.font = fontStr;
        this.pRef.nativeElement.style.lineHeight = this.textBoxRef.nativeElement.style.fontSize;
    }

    public setColor(color: string) {
        this.textBoxRef.nativeElement.style.color = color;
    }

    public setPosition(x: number, y: number) {
        this.textBoxRef.nativeElement.style.top = y - this.borderWidth + 'px';
        this.textBoxRef.nativeElement.style.left = x - this.borderWidth + 'px';
    }

    public isEmpty(): boolean {
        return this.currentText.trim() === '';
    }

    public focus() {
        setTimeout(_ => {
            this.inputRef.nativeElement.focus();
        }, 0);
    }

    public clear() {
        this.currentText = '';
    }

    public onBlur(): Promise<any> {
        return new Promise<any>(resolve => {
            this.inputRef.nativeElement.addEventListener('blur', resolve);
        });
    }

    public getLineHeight(): number {
        return this.getLineHeightHelper(this.textBoxRef.nativeElement);
    }

    private getLineHeightHelper(el: HTMLDivElement): number {
        let temp = document.createElement(el.nodeName);
        temp.setAttribute('style', `margin:0px;padding:0px;font-family:${el.style.fontFamily};font-size:${el.style.fontSize}`);
        temp.innerHTML = 'test';
        temp = el.parentNode.appendChild(temp);
        const ret = temp.clientHeight;
        temp.parentNode.removeChild(temp);
        return ret;
    }

}
